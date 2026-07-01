import express, { Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { protect, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as jwt.SignOptions);
}

// POST /api/auth/register
router.post("/register", async (req, res: Response) => {
  try {
    const { name, email, password, role, department_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      department_id: department_id || null,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: (error as Error).message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: (error as Error).message });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).populate("department_id", "name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

export default router;