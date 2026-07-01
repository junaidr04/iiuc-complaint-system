import express, { Response } from "express";
import { Complaint } from "../models/Complaint.js";
import { User } from "../models/User.js";
import { Department } from "../models/Department.js";
import { protect, restrictTo, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// GET /api/stats/student - Logged-in student's own stats
router.get("/student", protect, async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await Complaint.find({ created_by: req.userId }).select("status");
    res.json({
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "pending").length,
      inReview: complaints.filter((c) => c.status === "in_review").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// GET /api/stats/system - Admin dashboard stats
router.get("/system", protect, restrictTo("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const [complaints, totalUsers, totalDepartments] = await Promise.all([
      Complaint.find().select("status"),
      User.countDocuments(),
      Department.countDocuments(),
    ]);

    res.json({
      totalComplaints: complaints.length,
      pending: complaints.filter((c) => c.status === "pending").length,
      inReview: complaints.filter((c) => c.status === "in_review").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
      totalUsers,
      totalDepartments,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch system stats" });
  }
});

// GET /api/stats/analytics - Admin analytics charts data
router.get("/analytics", protect, restrictTo("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await Complaint.find()
      .populate("department_id", "name")
      .select("status department_id createdAt")
      .sort({ createdAt: 1 })
      .limit(1000)
      .lean();

    const pending = complaints.filter((c) => c.status === "pending").length;
    const inReview = complaints.filter((c) => c.status === "in_review").length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    const byStatus = [
      { name: "Pending", value: pending },
      { name: "In Review", value: inReview },
      { name: "Resolved", value: resolved },
    ];

    const deptMap: Record<string, number> = {};
    for (const c of complaints) {
      const dept = c.department_id as unknown as { name?: string } | null;
      const deptName = dept?.name ?? "Unassigned";
      deptMap[deptName] = (deptMap[deptName] || 0) + 1;
    }
    const byDepartment = Object.entries(deptMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const monthMap: Record<string, { complaints: number; resolved: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthMap[key] = { complaints: 0, resolved: 0 };
    }
    for (const c of complaints) {
      const d = new Date(c.createdAt as unknown as string);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (monthMap[key]) {
        monthMap[key].complaints += 1;
        if (c.status === "resolved") monthMap[key].resolved += 1;
      }
    }
    const byMonth = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }));

    res.json({ byStatus, byDepartment, byMonth });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

export default router;