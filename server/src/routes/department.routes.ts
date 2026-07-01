import express, { Response } from "express";
import { Department } from "../models/Department.js";
import { protect, restrictTo, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// GET /api/departments - Anyone logged in can view
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const departments = await Department.find()
      .populate("assigned_authority_id", "name email")
      .sort({ name: 1 });
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments" });
  }
});

// POST /api/departments - Admin only
router.post("/", protect, restrictTo("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const department = await Department.create({ name, description });
    res.status(201).json({ department });
  } catch (error) {
    res.status(500).json({ message: "Failed to create department" });
  }
});

// PATCH /api/departments/:id - Admin only
router.patch("/:id", protect, restrictTo("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json({ department });
  } catch (error) {
    res.status(500).json({ message: "Failed to update department" });
  }
});

// DELETE /api/departments/:id - Admin only
router.delete("/:id", protect, restrictTo("admin"), async (req: AuthRequest, res: Response) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete department" });
  }
});

// PATCH /api/departments/:id/assign - Admin only, assign authority
router.patch("/:id/assign", protect, restrictTo("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { authority_id } = req.body;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { assigned_authority_id: authority_id || null },
      { new: true }
    );
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json({ department });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign authority" });
  }
});

export default router;