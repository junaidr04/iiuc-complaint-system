import { Router } from "express";

const router = Router();

// আপনার স্ট্যাটস বা অ্যানালিটিক্স এর রাউটগুলো এখানে হবে
router.get("/", (req, res) => {
  res.json({ message: "Stats route is working properly!" });
});

export default router;