import express, { Response } from "express";
import { User } from "../models/User.js";
import { protect, restrictTo, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// GET /api/users - Admin only, list all users (with optional search)
router.get("/", protect, restrictTo("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }
    const users = await User.find(filter)
      .populate("department_id", "name")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// PATCH /api/users/:id/role - Admin only
router.patch("/:id/role", protect, restrictTo("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role" });
  }
});

// DELETE /api/users/:id - Admin only
router.delete("/:id", protect, restrictTo("admin"), async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// PATCH /api/users/profile - Any logged-in user updates own profile
router.patch("/profile", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { name, profile_image } = req.body;
    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (profile_image !== undefined) updates.profile_image = profile_image;

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;