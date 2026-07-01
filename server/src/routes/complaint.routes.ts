import express, { Response } from "express";
import { Complaint } from "../models/Complaint.js";
import { ComplaintTimeline } from "../models/ComplaintTimeline.js";
import { Comment } from "../models/Comment.js";
import { Upvote } from "../models/Upvote.js";
import { Department } from "../models/Department.js";
import { Notification } from "../models/Notification.js";
import { protect, restrictTo, AuthRequest } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const PAGE_SIZE = 10;

// GET /api/complaints/my - Student's own complaints
router.get("/my", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { status, department_id, search, sort, page = "1" } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;

    const filter: Record<string, unknown> = { created_by: req.userId };
    if (status && status !== "all") filter.status = status;
    if (department_id) filter.department_id = department_id;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "upvotes") sortOption = { upvote_count: -1 };

    const skip = (pageNum - 1) * PAGE_SIZE;
    const [data, total] = await Promise.all([
      Complaint.find(filter)
        .populate("department_id", "name")
        .populate("created_by", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(PAGE_SIZE),
      Complaint.countDocuments(filter),
    ]);

    res.json({ data, total });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// GET /api/complaints - All complaints (Admin)
router.get("/", protect, restrictTo("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { status, department_id, search, sort, page = "1" } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;
    if (department_id) filter.department_id = department_id;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "upvotes") sortOption = { upvote_count: -1 };

    const skip = (pageNum - 1) * PAGE_SIZE;
    const [data, total] = await Promise.all([
      Complaint.find(filter)
        .populate("department_id", "name")
        .populate("created_by", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(PAGE_SIZE),
      Complaint.countDocuments(filter),
    ]);

    res.json({ data, total });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// GET /api/complaints/assigned - Authority's assigned complaints
router.get("/assigned", protect, restrictTo("authority"), async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, sort, page = "1" } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;

    const myDepartments = await Department.find({ assigned_authority_id: req.userId }).select("_id");
    const deptIds = myDepartments.map((d) => d._id);

    const filter: Record<string, unknown> = {
      $or: [{ assigned_authority_id: req.userId }, { department_id: { $in: deptIds } }],
    };
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$and = [
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "upvotes") sortOption = { upvote_count: -1 };

    const skip = (pageNum - 1) * PAGE_SIZE;
    const [data, total] = await Promise.all([
      Complaint.find(filter)
        .populate("department_id", "name")
        .populate("created_by", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(PAGE_SIZE),
      Complaint.countDocuments(filter),
    ]);

    res.json({ data, total });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned complaints" });
  }
});

// GET /api/complaints/:id - Single complaint with comments & timeline
router.get("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("department_id", "name")
      .populate("created_by", "name profile_image")
      .lean();

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const comments = await Comment.find({ complaint_id: req.params.id })
      .populate("author_id", "name profile_image")
      .sort({ createdAt: 1 })
      .limit(50);

    const timeline = await ComplaintTimeline.find({ complaint_id: req.params.id })
      .populate("changed_by", "name")
      .sort({ createdAt: 1 });

    const upvoted = await Upvote.findOne({ complaint_id: req.params.id, user_id: req.userId });

    res.json({
      ...complaint,
      comments,
      complaint_timeline: timeline,
      user_upvoted: !!upvoted,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaint" });
  }
});

// POST /api/complaints - Create new complaint (with optional image)
router.post("/", protect, upload.single("image"), async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, description, department_id, is_anonymous } = req.body;

    let image_url: string | null = null;
    if (req.file) {
      const filename = `${Date.now()}_complaint.webp`;
      const filepath = path.join(UPLOADS_DIR, filename);
      await sharp(req.file.buffer)
        .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filepath);
      image_url = `/uploads/${filename}`;
    }

    const complaint = await Complaint.create({
      title,
      category,
      description,
      department_id: department_id || null,
      is_anonymous: is_anonymous === "true" || is_anonymous === true,
      image_url,
      created_by: req.userId,
    });

    await ComplaintTimeline.create({
      complaint_id: complaint._id,
      status: "pending",
      changed_by: req.userId,
      note: "Complaint submitted",
    });

    res.status(201).json({ id: complaint._id, complaint });
  } catch (error) {
    res.status(500).json({ message: "Failed to create complaint", error: (error as Error).message });
  }
});

// PATCH /api/complaints/:id/status - Update status (Authority/Admin)
router.patch(
  "/:id/status",
  protect,
  restrictTo("authority", "admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status, note } = req.body;
      const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!complaint) return res.status(404).json({ message: "Complaint not found" });

      await ComplaintTimeline.create({
        complaint_id: complaint._id,
        status,
        changed_by: req.userId,
        note: note || null,
      });

      await Notification.create({
        receiver_id: complaint.created_by,
        complaint_id: complaint._id,
        message: `Your complaint "${complaint.title}" status changed to ${status}`,
        type: status === "resolved" ? "resolved" : "status_change",
      });

      res.json({ complaint });
    } catch (error) {
      res.status(500).json({ message: "Failed to update status" });
    }
  }
);

// PATCH /api/complaints/:id/assign - Assign to authority (Admin)
router.patch("/:id/assign", protect, restrictTo("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { authority_id } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assigned_authority_id: authority_id },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    await Notification.create({
      receiver_id: authority_id,
      complaint_id: complaint._id,
      message: `You have been assigned a complaint: "${complaint.title}"`,
      type: "assigned",
    });

    res.json({ complaint });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign complaint" });
  }
});

// DELETE /api/complaints/:id - Admin only
router.delete("/:id", protect, restrictTo("admin"), async (req: AuthRequest, res: Response) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ complaint_id: req.params.id });
    await ComplaintTimeline.deleteMany({ complaint_id: req.params.id });
    await Upvote.deleteMany({ complaint_id: req.params.id });
    res.json({ message: "Complaint deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete complaint" });
  }
});

// POST /api/complaints/:id/upvote - Toggle upvote
router.post("/:id/upvote", protect, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await Upvote.findOne({ complaint_id: req.params.id, user_id: req.userId });

    if (existing) {
      await Upvote.deleteOne({ _id: existing._id });
      await Complaint.findByIdAndUpdate(req.params.id, { $inc: { upvote_count: -1 } });
      return res.json({ upvoted: false });
    } else {
      await Upvote.create({ complaint_id: req.params.id, user_id: req.userId });
      await Complaint.findByIdAndUpdate(req.params.id, { $inc: { upvote_count: 1 } });
      return res.json({ upvoted: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle upvote" });
  }
});

// POST /api/complaints/:id/comments - Add comment
router.post("/:id/comments", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const comment = await Comment.create({
      complaint_id: req.params.id,
      author_id: req.userId,
      content,
    });
    const populated = await comment.populate("author_id", "name profile_image");

    const complaint = await Complaint.findById(req.params.id);
    if (complaint && complaint.created_by.toString() !== req.userId) {
      await Notification.create({
        receiver_id: complaint.created_by,
        complaint_id: complaint._id,
        message: `New comment on your complaint "${complaint.title}"`,
        type: "new_comment",
      });
    }

    res.status(201).json({ comment: populated });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
});

export default router;