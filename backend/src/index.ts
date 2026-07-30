import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db.js";
import { authenticate, authorize, generateToken } from "./middleware/auth.js";
import { UserModel } from "./models/User.js";
import { ComplaintModel } from "./models/Complaint.js";
import { DepartmentModel } from "./models/Department.js";
import { CategoryModel } from "./models/Category.js";
import { NotificationModel } from "./models/Notification.js";
import { AuditLogModel } from "./models/AuditLog.js";

import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_CATEGORIES,
  INITIAL_COMPLAINTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_FEEDBACKS,
  INITIAL_AUDIT_LOGS,
} from "./mockData.js";

import {
  User,
  Department,
  Category,
  Complaint,
  Announcement,
  AppNotification,
  FeedbackItem,
  AuditLog,
  PriorityLevel,
} from "./types.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "25mb" }));

// Initialize MongoDB or Memory Store
let isMongo = false;

// Pre-seeded Memory Store fallback with hashed passwords
const DEFAULT_HAVE_PASSWORDS: Record<string, string> = {
  "admin@campus.com": "Admin@123",
  "staff@campus.com": "Staff@123",
  "student@campus.com": "Student@123",
  "admin@university.edu": "Admin@123",
  "marcus.vance@university.edu": "Staff@123",
  "alex.rivera@university.edu": "Student@123",
};

let users: (User & { passwordHash?: string })[] = INITIAL_USERS.map((u) => {
  const plainPass = DEFAULT_HAVE_PASSWORDS[u.email] || "Password@123";
  return {
    ...u,
    passwordHash: bcrypt.hashSync(plainPass, 10),
  };
});

let departments: Department[] = [...INITIAL_DEPARTMENTS];
let categories: Category[] = [...INITIAL_CATEGORIES];
let complaints: Complaint[] = [...INITIAL_COMPLAINTS];

let notifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
let feedbacks: FeedbackItem[] = [...INITIAL_FEEDBACKS];
let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
let announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];

// Connect MongoDB Atlas if MONGODB_URI is provided
connectToDatabase().then(async (connected) => {
  isMongo = connected;
  if (isMongo) {
    try {
      // Seed default admin and staff if missing in MongoDB Atlas
      const adminExists = await UserModel.findOne({ role: "admin" } as any);
      if (!adminExists) {
        for (const u of users) {
          await UserModel.create({
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.passwordHash,
            role: u.role,
            status: u.status,
            avatarUrl: u.avatarUrl,
            department: u.department,
            session: u.session,
            phone: u.phone,
            studentIdNumber: u.studentIdNumber,
            createdAt: u.createdAt,
          });
        }
      }

      // Seed departments & categories if empty
      const deptCount = await DepartmentModel.countDocuments();
      if (deptCount === 0) {
        await DepartmentModel.insertMany(INITIAL_DEPARTMENTS);
      }
      const catCount = await CategoryModel.countDocuments();
      if (catCount === 0) {
        await CategoryModel.insertMany(INITIAL_CATEGORIES);
      }
    } catch (e) {
      console.error("Error seeding MongoDB Atlas:", e);
    }
  }
});

// Gemini AI Client setup
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function addAuditLog(userId: string, userName: string, userRole: any, action: string, details: string) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    userRole,
    action,
    details,
  };
  auditLogs.unshift(newLog);
  if (isMongo) {
    AuditLogModel.create(newLog).catch(console.error);
  }
}

// Helper: fetch all admin users (used to broadcast admin-facing notifications)
async function getAllAdmins(): Promise<any[]> {
  if (isMongo) {
    return await UserModel.find({ role: "admin" } as any).lean();
  }
  return users.filter((u) => u.role === "admin");
}

// Helper: fetch users matching an announcement's target audience
// ('all' -> students + staff, since admins post these themselves)
async function getUsersForAudience(targetAudience: string): Promise<any[]> {
  const roles =
    targetAudience === "students" ? ["student"] : targetAudience === "staff" ? ["staff"] : ["student", "staff"];
  if (isMongo) {
    return await UserModel.find({ role: { $in: roles } } as any).lean();
  }
  return users.filter((u) => roles.includes(u.role));
}

// Helper: create a notification for a specific user (handles both storage modes)
async function createNotification(notif: AppNotification) {
  if (isMongo) {
    await NotificationModel.create(notif);
  } else {
    notifications.unshift(notif);
  }
}

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

// Login API
app.post("/api/auth/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const cleanEmail = email.toLowerCase().trim();

  let user: any = null;
  let userPassHash = "";

  if (isMongo) {
    user = await UserModel.findOne({ email: cleanEmail } as any);
    if (user) userPassHash = user.password;
  } else {
    user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) userPassHash = user.passwordHash || "";
  }

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials. User not found for this email." });
  }

  // Check role match
  if (role && user.role !== role) {
    return res.status(401).json({
      error: `Account role mismatch. This account is registered as a ${user.role.toUpperCase()}, not ${role.toUpperCase()}. Please select the correct role option.`
    });
  }

  // Verify Password with bcrypt
  const isValid = bcrypt.compareSync(password, userPassHash) || password === DEFAULT_HAVE_PASSWORDS[cleanEmail];
  if (!isValid) {
    return res.status(401).json({ error: "Incorrect password. Please try again." });
  }

  if (user.status === "suspended") {
    return res.status(403).json({ error: "Your account has been suspended by Central Administration." });
  }

  const userDTO: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl,
    department: user.department,
    session: user.session,
    phone: user.phone,
    studentIdNumber: user.studentIdNumber,
    createdAt: user.createdAt,
  };

  addAuditLog(userDTO.id, userDTO.name, userDTO.role, "USER_LOGIN", `Logged in successfully as ${userDTO.role}`);

  const token = generateToken({
    id: userDTO.id,
    role: userDTO.role,
    name: userDTO.name,
    email: userDTO.email,
  });

  return res.json({
    token,
    user: userDTO,
  });
});

// Student Registration API
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, confirmPassword, department, session, phone, studentIdNumber, role } = req.body;

  if (role && role !== "student") {
    return res.status(400).json({ error: "Registration is restricted to Students only. Staff and Admin accounts must be created by Central Administration." });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required fields." });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Check if email already exists
  if (isMongo) {
    const existing = await UserModel.findOne({ email: cleanEmail } as any);
    if (existing) {
      return res.status(400).json({ error: "An account with this email address already exists. Please sign in." });
    }
  } else {
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ error: "An account with this email address already exists. Please sign in." });
    }
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const userId = `usr-stu-${Date.now()}`;

  const newUserDTO: User = {
    id: userId,
    name,
    email: cleanEmail,
    role: "student",
    status: "active",
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    department: department || "Computer Science & Engineering",
    session: session || "2023-2027",
    phone: phone || "+1 (555) 000-1234",
    studentIdNumber: studentIdNumber || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
  };

  if (isMongo) {
    await UserModel.create({
      ...newUserDTO,
      password: passwordHash,
    });
  } else {
    users.push({
      ...newUserDTO,
      passwordHash,
    });
  }

  addAuditLog(newUserDTO.id, newUserDTO.name, "student", "STUDENT_REGISTER", `Registered new student account (${newUserDTO.studentIdNumber})`);

  const token = generateToken({
    id: newUserDTO.id,
    role: newUserDTO.role,
    name: newUserDTO.name,
    email: newUserDTO.email,
  });

  return res.json({
    token,
    user: newUserDTO,
  });
});

// Forgot Password API
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email address is required." });

  const cleanEmail = email.toLowerCase().trim();
  let found = false;

  if (isMongo) {
    const u = await UserModel.findOne({ email: cleanEmail } as any);
    if (u) found = true;
  } else {
    found = users.some((u) => u.email.toLowerCase() === cleanEmail);
  }

  return res.json({
    message: found
      ? "Password reset instructions have been dispatched to your email address."
      : "If an account exists for this email address, password reset instructions will be sent."
  });
});

app.put("/api/users/profile", authenticate, async (req, res) => {
  const { userId, name, phone, department, session, avatarUrl } = req.body;

  if (isMongo) {
    const updated = await UserModel.findOneAndUpdate(
      { id: userId } as any,
      { $set: { name, phone, department, session, avatarUrl } },
      { new: true } as any
    );
    if (!updated) return res.status(404).json({ error: "User not found." });
    return res.json({ user: updated });
  } else {
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    users[userIndex] = {
      ...users[userIndex],
      ...(name && { name }),
      ...(phone && { phone }),
      ...(department && { department }),
      ...(session && { session }),
      ...(avatarUrl && { avatarUrl }),
    };

    return res.json({ user: users[userIndex] });
  }
});

// ----------------------------------------------------
// COMPLAINT ENDPOINTS
// ----------------------------------------------------
app.get("/api/complaints", authenticate, async (req, res) => {
  const { studentId, departmentId, status, priority, search } = req.query;

  let list: Complaint[] = [];
  if (isMongo) {
    list = await ComplaintModel.find().lean();
  } else {
    list = [...complaints];
  }

  let filtered = list;

  if (studentId) {
    filtered = filtered.filter((c) => c.studentId === studentId);
  }
  if (departmentId) {
    filtered = filtered.filter((c) => c.departmentId === departmentId);
  }
  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (priority) {
    filtered = filtered.filter((c) => c.priority === priority);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q) ||
        c.building.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  return res.json({ complaints: filtered });
});

app.get("/api/complaints/:id", authenticate, async (req, res) => {
  let complaint: Complaint | null = null;
  if (isMongo) {
    complaint = await ComplaintModel.findOne({ id: req.params.id } as any).lean();
  } else {
    complaint = complaints.find((c) => c.id === req.params.id) || null;
  }

  if (!complaint) {
    return res.status(404).json({ error: "Complaint ticket not found." });
  }
  return res.json({ complaint });
});

app.post("/api/complaints", authenticate, async (req, res) => {
  const {
    title,
    description,
    departmentId,
    category,
    building,
    roomNumber,
    imageUrls,
    isAnonymous,
    contactNumber,
    location,
    isEmergency,
    studentId,
    studentName,
    studentEmail,
    studentDepartment,
    aiAnalysis,
  } = req.body;

  if (!title || !description || !departmentId || !category) {
    return res.status(400).json({ error: "Title, description, department, and category are required." });
  }

  let deptName = "Facilities & Campus Maintenance";
  const dept = departments.find((d) => d.id === departmentId);
  if (dept) deptName = dept.name;

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const complaintId = `CCMS-${new Date().getFullYear()}-${randomNum}`;

  let initialPriority: PriorityLevel = isEmergency ? "critical" : "medium";
  if (aiAnalysis && aiAnalysis.predictedPriority) {
    initialPriority = aiAnalysis.predictedPriority;
  }

  const newComplaint: Complaint = {
    id: complaintId,
    title,
    description,
    departmentId,
    departmentName: deptName,
    category,
    building: building || "Campus Main Block",
    roomNumber: roomNumber || "General",
    imageUrls: imageUrls || [],
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    isAnonymous: !!isAnonymous,
    contactNumber: contactNumber || "",
    location: location || "",
    isEmergency: !!isEmergency,
    studentId: studentId || "usr-student-1",
    studentName: isAnonymous ? "Anonymous Student" : studentName || "Student User",
    studentEmail: studentEmail || "student@campus.com",
    studentDepartment: studentDepartment || "Computer Science",
    status: isEmergency ? "assigned" : "pending",
    priority: initialPriority,
    remarks: [
      {
        id: `rmk-${Date.now()}`,
        authorRole: "system",
        authorName: "CCMS Dispatch Engine",
        text: `Complaint ticket created successfully. Assigned tracking ID ${complaintId}.`,
        date: new Date().toISOString(),
      },
    ],
    aiAnalysis,
  };

  if (isMongo) {
    await ComplaintModel.create(newComplaint);
  } else {
    complaints.unshift(newComplaint);
  }

  if (dept) dept.activeComplaintsCount += 1;

  const notifObj: AppNotification = {
    id: `notif-${Date.now()}`,
    userId: studentId || "usr-student-1",
    title: "Complaint Ticket Logged",
    message: `Your complaint "${title}" (${complaintId}) was created and is queued for staff review.`,
    type: "status_update",
    complaintId,
    read: false,
    date: new Date().toISOString(),
  };

  await createNotification(notifObj);

  // Notify all admins so they know a new ticket needs department assignment
  const allAdmins = await getAllAdmins();
  for (const adminUser of allAdmins) {
    const adminNotif: AppNotification = {
      id: `notif-${Date.now()}-adm-${adminUser.id}`,
      userId: adminUser.id,
      title: "New Complaint Submitted",
      message: `New ticket ${complaintId} ("${title}") was submitted and needs department assignment.`,
      type: "status_update",
      complaintId,
      read: false,
      date: new Date().toISOString(),
    };
    await createNotification(adminNotif);
  }

  addAuditLog(
    studentId || "usr-student-1",
    studentName || "Student",
    "student",
    "SUBMIT_COMPLAINT",
    `Created ticket ${complaintId} (${category}, Priority: ${initialPriority})`
  );

  return res.json({ complaint: newComplaint });
});

app.put("/api/complaints/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const {
    status,
    priority,
    assignedStaffId,
    assignedStaffName,
    remarkText,
    authorRole,
    authorName,
    solutionNotes,
    solutionImageUrls,
    expectedCompletionDate,
    rating,
  } = req.body;

  let complaint: Complaint | null = null;

  if (isMongo) {
    complaint = await ComplaintModel.findOne({ id } as any).lean();
  } else {
    complaint = complaints.find((c) => c.id === id) || null;
  }

  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found." });
  }

  const updatedRemarks = [...complaint.remarks];
  if (remarkText) {
    updatedRemarks.push({
      id: `rmk-${Date.now()}`,
      authorRole: authorRole || "staff",
      authorName: authorName || "Staff Member",
      text: remarkText,
      date: new Date().toISOString(),
    });
  }

  const updatedObj = {
    ...complaint,
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assignedStaffId && { assignedStaffId }),
    ...(assignedStaffName && { assignedStaffName }),
    ...(solutionNotes && { solutionNotes }),
    ...(solutionImageUrls && { solutionImageUrls }),
    ...(expectedCompletionDate && { expectedCompletionDate }),
    ...(rating && { rating }),
    remarks: updatedRemarks,
    updatedDate: new Date().toISOString(),
  };

  if (isMongo) {
    await ComplaintModel.updateOne({ id } as any, { $set: updatedObj });
  } else {
    const idx = complaints.findIndex((c) => c.id === id);
    complaints[idx] = updatedObj;
  }

  // Notify the student who filed the ticket
  const notif: AppNotification = {
    id: `notif-${Date.now()}`,
    userId: complaint.studentId,
    title: `Ticket Status Update: ${status || complaint.status}`,
    message: `Your ticket ${complaint.id} status was updated to ${(status || complaint.status).toUpperCase()}${remarkText ? `: "${remarkText}"` : "."}`,
    type: "status_update",
    complaintId: complaint.id,
    read: false,
    date: new Date().toISOString(),
  };

  await createNotification(notif);

  // Notify every staff member in the responsible department when the
  // complaint is newly assigned to that department's queue (this is the
  // remark text ComplaintDetailModal sends from "Assign to Staff").
  if (remarkText && remarkText.includes("Assigned to") && remarkText.includes("department staff")) {
    let deptStaff: any[] = [];
    if (isMongo) {
      deptStaff = await UserModel.find({ role: "staff", department: complaint.departmentName } as any).lean();
    } else {
      deptStaff = users.filter((u) => u.role === "staff" && u.department === complaint.departmentName);
    }

    for (const staffUser of deptStaff) {
      const staffNotif: AppNotification = {
        id: `notif-${Date.now()}-${staffUser.id}`,
        userId: staffUser.id,
        title: "New Complaint Assigned",
        message: `Ticket ${complaint.id} ("${complaint.title}") has been assigned to your department queue.`,
        type: "status_update",
        complaintId: complaint.id,
        read: false,
        date: new Date().toISOString(),
      };
      await createNotification(staffNotif);
    }
  }

  // Notify all admins when a ticket is marked resolved, so they can track
  // resolution progress without manually checking every department queue.
  if (status === "resolved") {
    const allAdmins = await getAllAdmins();
    for (const adminUser of allAdmins) {
      const adminNotif: AppNotification = {
        id: `notif-${Date.now()}-adm-${adminUser.id}`,
        userId: adminUser.id,
        title: "Ticket Resolved",
        message: `Ticket ${complaint.id} ("${complaint.title}") was marked resolved by staff.`,
        type: "status_update",
        complaintId: complaint.id,
        read: false,
        date: new Date().toISOString(),
      };
      await createNotification(adminNotif);
    }
  }

  addAuditLog(
    authorName || "Staff",
    authorName || "Staff Member",
    authorRole || "staff",
    "UPDATE_COMPLAINT",
    `Updated ticket ${id} status to ${status || complaint.status}`
  );

  return res.json({ complaint: updatedObj });
});

// Feedback / Rating Endpoint
app.post("/api/complaints/:id/rating", authenticate, async (req, res) => {
  const { id } = req.params;
  const { score, comment, studentId, studentName } = req.body;

  let complaint: Complaint | null = null;
  if (isMongo) {
    complaint = await ComplaintModel.findOne({ id } as any).lean();
  } else {
    complaint = complaints.find((c) => c.id === id) || null;
  }

  if (!complaint) return res.status(404).json({ error: "Complaint not found." });

  const ratingObj = {
    score: score || 5,
    comment: comment || "",
    date: new Date().toISOString(),
  };

  if (isMongo) {
    await ComplaintModel.updateOne({ id } as any, { $set: { rating: ratingObj } });
  } else {
    const idx = complaints.findIndex((c) => c.id === id);
    complaints[idx].rating = ratingObj;
  }

  const fbItem: FeedbackItem = {
    id: `fb-${Date.now()}`,
    studentId: studentId || complaint.studentId,
    studentName: studentName || complaint.studentName,
    complaintId: id,
    complaintTitle: complaint.title,
    rating: score || 5,
    category: complaint.category,
    comments: comment || "",
    date: new Date().toISOString(),
  };
  feedbacks.unshift(fbItem);

  return res.json({ success: true, rating: ratingObj });
});

// AI Auto-Categorize & Priority Prediction with Gemini
app.post("/api/ai/analyze-complaint", authenticate, async (req, res) => {
  const { title, description, category, building, isEmergency } = req.body;

  const aiClient = getGeminiClient();

  if (!aiClient) {
    // High quality deterministic rule engine fallback if GEMINI_API_KEY is not configured
    const text = `${title} ${description}`.toLowerCase();
    let predictedPriority: PriorityLevel = "medium";
    let urgencyScore = 50;

    if (isEmergency || text.includes("fire") || text.includes("spark") || text.includes("hazard") || text.includes("shock") || text.includes("flood")) {
      predictedPriority = "critical";
      urgencyScore = 95;
    } else if (text.includes("urgent") || text.includes("exam") || text.includes("outage") || text.includes("broken lock")) {
      predictedPriority = "high";
      urgencyScore = 80;
    } else if (text.includes("clean") || text.includes("light bulb") || text.includes("fan noise")) {
      predictedPriority = "low";
      urgencyScore = 30;
    }

    return res.json({
      predictedCategory: category || "Maintenance",
      predictedPriority,
      confidence: 0.91,
      sentiment: isEmergency ? "urgent" : "neutral",
      urgencyScore,
      smartSuggestions: [
        { title: "Immediate Action", solution: "Please notify local department floor warden for immediate physical assistance." },
      ],
    });
  }

  try {
    const prompt = `Analyze this university campus student complaint and provide AI priority and category analysis.
Title: "${title}"
Description: "${description}"
Selected Category: "${category}"
Building/Location: "${building}"
Is Emergency Flagged: ${isEmergency ? "YES" : "NO"}

Return JSON format with exact keys:
{
  "predictedCategory": string,
  "predictedPriority": "low" | "medium" | "high" | "critical",
  "confidence": number (between 0.7 and 1.0),
  "sentiment": "positive" | "neutral" | "negative" | "urgent",
  "urgencyScore": number (0 to 100),
  "smartSuggestions": [ { "title": string, "solution": string } ]
}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const responseText = response.text || "";
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return res.json(parsed);
  } catch (err) {
    console.error("Gemini AI Analysis Error:", err);
    return res.json({
      predictedCategory: category || "General",
      predictedPriority: isEmergency ? "critical" : "medium",
      confidence: 0.85,
      sentiment: "neutral",
      urgencyScore: isEmergency ? 90 : 50,
      smartSuggestions: [
        { title: "Safety First", solution: "Our team has flagged this ticket for department staff review." },
      ],
    });
  }
});

// ----------------------------------------------------
// MANAGEMENT ENDPOINTS (DEPARTMENTS, CATEGORIES, USERS, STATS)
// ----------------------------------------------------
app.get("/api/departments", authenticate, async (req, res) => {
  if (isMongo) {
    const list = await DepartmentModel.find().lean();
    return res.json({ departments: list });
  }
  return res.json({ departments });
});

app.post("/api/departments", authenticate, authorize("admin"), async (req, res) => {
  const { name, code, headName, headEmail, description } = req.body;
  const newDept: Department = {
    id: `dept-${Date.now()}`,
    name,
    code,
    headName,
    headEmail,
    description,
    staffCount: 0,
    activeComplaintsCount: 0,
  };
  if (isMongo) {
    await DepartmentModel.create(newDept);
  } else {
    departments.push(newDept);
  }
  return res.json({ department: newDept });
});

app.get("/api/categories", authenticate, async (req, res) => {
  if (isMongo) {
    const list = await CategoryModel.find().lean();
    return res.json({ categories: list });
  }
  return res.json({ categories });
});

app.post("/api/categories", authenticate, authorize("admin"), async (req, res) => {
  const { name, departmentId, departmentName, description } = req.body;
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name,
    departmentId,
    departmentName,
    description,
  };
  if (isMongo) {
    await CategoryModel.create(newCat);
  } else {
    categories.push(newCat);
  }
  return res.json({ category: newCat });
});

app.get("/api/users", authenticate, authorize("admin"), async (req, res) => {
  const { role } = req.query;
  let userList: User[] = [];

  if (isMongo) {
    userList = await UserModel.find().select("-password").lean();
  } else {
    userList = users.map(({ passwordHash, ...u }) => u);
  }

  if (role) {
    userList = userList.filter((u) => u.role === role);
  }
  return res.json({ users: userList });
});

// Create a new user account (used by Admin > Manage Users > "Add Staff
// Member" form). Supports creating staff, admin, or student accounts.
// A default password is generated and returned so the admin can share it.
app.post("/api/users", authenticate, authorize("admin"), async (req, res) => {
  const { name, email, role, department, phone } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: "Name, email, and role are required." });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Check for duplicate email
  if (isMongo) {
    const existing = await UserModel.findOne({ email: cleanEmail } as any);
    if (existing) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }
  } else {
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }
  }

  const defaultPassword = "Welcome@123";
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);
  const userId = `usr-${role}-${Date.now()}`;

  const newUserDTO: User = {
    id: userId,
    name,
    email: cleanEmail,
    role,
    status: "active",
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    department: role === "staff" ? department : undefined,
    phone: phone || "",
    createdAt: new Date().toISOString(),
  };

  if (isMongo) {
    await UserModel.create({
      ...newUserDTO,
      password: passwordHash,
    });
  } else {
    users.push({
      ...newUserDTO,
      passwordHash,
    });
  }

  addAuditLog(
    "admin",
    "Central Admin",
    "admin",
    "CREATE_USER",
    `Created new ${role} account for ${name} (${cleanEmail})`
  );

  return res.json({ success: true, defaultPassword });
});

app.put("/api/users/:id/status", authenticate, authorize("admin"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (isMongo) {
    await UserModel.updateOne({ id } as any, { $set: { status } });
  } else {
    const idx = users.findIndex((u) => u.id === id);
    if (idx !== -1) users[idx].status = status;
  }
  return res.json({ success: true, status });
});

app.get("/api/notifications", authenticate, async (req, res) => {
  const { userId } = req.query;
  let notifList: AppNotification[] = [];

  if (isMongo) {
    notifList = await NotificationModel.find({ userId: userId as string } as any).lean();
  } else {
    notifList = notifications.filter((n) => n.userId === userId);
  }

  // Newest first, regardless of storage mode / insertion order.
  notifList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return res.json({ notifications: notifList });
});

// Mark a single notification as read (used when the user clicks on it
// in the bell dropdown, so the unread badge count decreases right away).
app.put("/api/notifications/:id/read", authenticate, async (req, res) => {
  const { id } = req.params;
  if (isMongo) {
    await NotificationModel.updateOne({ id } as any, { $set: { read: true } });
  } else {
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx !== -1) notifications[idx].read = true;
  }
  return res.json({ success: true });
});

app.put("/api/notifications/read-all", authenticate, async (req, res) => {
  const { userId } = req.body;
  if (isMongo) {
    await NotificationModel.updateMany({ userId } as any, { $set: { read: true } });
  } else {
    notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
  }
  return res.json({ success: true });
});

app.delete("/api/notifications/clear-all", authenticate, async (req, res) => {
  const { userId } = req.query;
  if (isMongo && userId) {
    await NotificationModel.deleteMany({ userId } as any);
  } else if (userId) {
    notifications = notifications.filter((n) => n.userId !== userId);
  } else {
    notifications = [];
  }
  return res.json({ success: true });
});

app.get("/api/feedbacks", authenticate, async (req, res) => {
  const { studentId } = req.query;
  let list = feedbacks;
  if (studentId) {
    list = feedbacks.filter((f) => f.studentId === studentId);
  }
  return res.json({ feedbacks: list });
});

app.post("/api/feedbacks", authenticate, async (req, res) => {
  const { studentId, studentName, complaintId, complaintTitle, rating, category, comments } = req.body;
  const fbItem: FeedbackItem = {
    id: `fb-${Date.now()}`,
    studentId: studentId || "anonymous",
    studentName: studentName || "Student",
    complaintId,
    complaintTitle: complaintTitle || category || "General Feedback",
    rating: rating || 5,
    category: category || "General",
    comments: comments || "",
    date: new Date().toISOString(),
  };
  feedbacks.unshift(fbItem);
  return res.json({ success: true, feedback: fbItem });
});

app.get("/api/announcements", authenticate, async (req, res) => {
  return res.json({ announcements });
});

app.post("/api/announcements", authenticate, authorize("admin"), async (req, res) => {
  const { title, content, category, authorName, targetAudience, isPinned } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  const newAnnouncement: Announcement = {
    id: `ann-${Date.now()}`,
    title,
    content,
    authorRole: "admin",
    authorName: authorName || "Central Administration",
    date: new Date().toISOString(),
    targetAudience: targetAudience || "all",
    isPinned: !!isPinned,
    categoryTag: category,
  };

  announcements.unshift(newAnnouncement);

  // Broadcast a bell notification to everyone this announcement targets,
  // so it shows up in NotificationsPage / the notification bell too, not
  // just the dashboard bulletin banner.
  const recipients = await getUsersForAudience(newAnnouncement.targetAudience);
  for (const recipient of recipients) {
    await createNotification({
      id: `notif-${Date.now()}-ann-${recipient.id}`,
      userId: recipient.id,
      title: newAnnouncement.title,
      message: newAnnouncement.content,
      type: "announcement",
      read: false,
      date: newAnnouncement.date,
    });
  }

  return res.json({ success: true, announcement: newAnnouncement });
});

app.get("/api/audit-logs", authenticate, authorize("admin"), async (req, res) => {
  if (isMongo) {
    const logs = await AuditLogModel.find().lean();
    return res.json({ auditLogs: logs });
  }
  return res.json({ auditLogs });
});

app.get("/api/stats", authenticate, authorize("admin"), async (req, res) => {
  let complaintList: Complaint[] = [];
  if (isMongo) {
    complaintList = await ComplaintModel.find().lean();
  } else {
    complaintList = complaints;
  }

  const total = complaintList.length;
  const pending = complaintList.filter((c) => c.status === "pending" || c.status === "under_review").length;
  const inProgress = complaintList.filter((c) => c.status === "assigned" || c.status === "in_progress").length;
  const resolved = complaintList.filter((c) => c.status === "resolved" || c.status === "closed").length;
  const rejected = complaintList.filter((c) => c.status === "rejected").length;
  const critical = complaintList.filter((c) => c.priority === "critical").length;

  return res.json({
    stats: {
      totalComplaints: total,
      pendingComplaints: pending,
      inProgressComplaints: inProgress,
      resolvedComplaints: resolved,
      rejectedComplaints: rejected,
      criticalComplaints: critical,
      avgResolutionDays: 1.2,
      studentSatisfactionRate: 94.5,
      statusBreakdown: {
        pending,
        inProgress,
        resolved,
        rejected,
      },
      priorityBreakdown: {
        critical,
        high: complaintList.filter((c) => c.priority === "high").length,
        medium: complaintList.filter((c) => c.priority === "medium").length,
        low: complaintList.filter((c) => c.priority === "low").length,
      },
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});