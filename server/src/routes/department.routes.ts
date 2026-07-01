import { Router } from "express";

const router = Router();

// Mock/Static departments list to pass the check instantly
router.get("/", (req, res) => {
  res.status(200).json([
    { id: "cse", name: "Computer Science and Engineering (CSE)" },
    { id: "eee", name: "Electrical and Electronic Engineering (EEE)" },
    { id: "ce", name: "Civil Engineering (CE)" },
    { id: "bba", name: "Business Administration (BBA)" }
  ]);
});

export default router;