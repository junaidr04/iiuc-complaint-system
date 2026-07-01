import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes Import
import authRoutes from "./routes/auth.routes";
import complaintRoutes from "./routes/complaint.routes";
import departmentRoutes from "./routes/department.routes";
import notificationRoutes from "./routes/notification.routes";
import statsRoutes from "./routes/stats.routes";
import userRoutes from "./routes/user.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Base Route Response
app.get("/", (req: Request, res: Response): void => {
  res.status(200).json({
    status: "success",
    message: "IIUC Complaint System Backend API is running smoothly!",
    version: "1.0.0"
  });
});

// /api/health
app.get("/api/health", (req: Request, res: Response): void => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: { database: "connected", server: "healthy" }
  });
});

// --- FIX: All API Routes Mapping ---
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/users", userRoutes);

// Server Setup
app.listen(PORT, () => {
  console.log(`🚀 Server is strictly running at http://localhost:${PORT}`);
});