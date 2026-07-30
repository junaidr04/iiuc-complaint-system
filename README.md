# 🎓 CCMS — IIUC Campus Complaint Management System

<p align="center">
  <strong>AI-powered digital grievance redressal platform for International Islamic University Chittagong (IIUC)</strong>
</p>

<p align="center">
  <a href="https://iiuc-complaint-system.vercel.app"><strong>🔗 Live Demo</strong></a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-tech-stack">Tech Stack</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue">
</p>

---

## 📖 Overview

CCMS digitizes the entire campus complaint lifecycle at IIUC — from a student reporting a broken AC or a safety hazard, to a department staff member resolving it, to an admin tracking resolution metrics campus-wide. It replaces informal, untracked complaint reporting (walk-ins, phone calls, word of mouth) with a transparent, auditable, role-based system.

**Live deployment:**
- Frontend: [iiuc-complaint-system.vercel.app](https://iiuc-complaint-system.vercel.app) (Vercel)
- Backend API: `iiuc-complaint-system.onrender.com` (Render)

> Backend runs on Render's free tier, which sleeps after inactivity — the first request after a while may take 30–50s to wake up.

---

## ✨ Features

### 🎓 Student
- Submit complaints with category, department, priority, building/room, and up to 3 photo attachments (uploaded directly from device gallery/camera)
- **AI Smart Assistant** — Gemini-powered auto-categorization, priority suggestion, and duplicate detection while typing
- Real-time status tracking on a visual timeline (Submitted → Under Review → Assigned → In Progress → Resolved)
- Downloadable **PDF receipt** with an embedded **QR code** for quick complaint lookup
- Post-resolution satisfaction rating & feedback
- In-app notifications for every status change

### 🛠 Staff
- Department-scoped complaint queue with filtering (Pending / In Progress / Resolved)
- Claim tickets, update status, attach resolution notes and proof photos

### 🛡 Admin / Super Admin
- Analytics dashboard — ticket volume, department load, resolution trends, satisfaction rate
- User, department, and category management
- Public announcement publishing
- Full **audit log** of every state-changing action platform-wide
- Cross-department complaint oversight and moderation

### 🔐 Security & Platform
- **JWT authentication** — signed tokens issued on login/register, verified server-side on every protected request (not just hidden in the UI)
- **Role-based access control** enforced in Express middleware (student / staff / admin)
- bcrypt password hashing
- Fully responsive, mobile-safe UI with light/dark theme

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4 |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Auth | JSON Web Tokens (jsonwebtoken), bcryptjs |
| AI | Google Gemini API (`@google/genai`) |
| Utilities | jsPDF (PDF receipts), qrcode (QR generation), lucide-react (icons) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
IIUC-Campus-Complaint/
├── frontend/                      React + Vite client
│   └── src/
│       ├── components/            Layout, complaint widgets, AI assistant
│       ├── context/                Auth & theme providers
│       ├── pages/                  public / student / staff / admin / shared routes
│       └── utils/
│           ├── api.ts              apiFetch() — attaches JWT, handles 401, prod API base URL
│           ├── pdfGenerator.ts
│           └── qrCode.ts
├── backend/                       Express + Mongoose API
│   └── src/
│       ├── models/                 User, Complaint, Department, Category, Notification, AuditLog
│       ├── middleware/
│       │   └── auth.ts             generateToken / authenticate / authorize
│       ├── db.ts
│       ├── mockData.ts             First-run seed data
│       └── index.ts                All API routes
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)
- (Optional) A [Google Gemini API key](https://ai.google.dev/) for the AI Smart Assistant

### 1. Clone & install
```bash
git clone https://github.com/junaidr04/iiuc-complaint-system.git
cd iiuc-complaint-system
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env     # fill in MONGODB_URI, JWT_SECRET, (GEMINI_API_KEY optional)
npm run dev               # → http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env      # leave VITE_API_URL empty for local dev
npm run dev                # → http://localhost:5173
```
Vite's dev server proxies `/api/*` to `localhost:5000` automatically.

### 4. Log in
The backend auto-seeds an admin account on first successful DB connection:
```
Email: admin@campus.com
Password: Admin@123
```
Or register a new student account from the UI.

---

## 🔐 How Authentication Works

1. Login/register issues a **signed JWT** (7-day expiry) containing the user's id, role, name, and email.
2. The frontend stores it in `localStorage` and attaches `Authorization: Bearer <token>` to every API call via `apiFetch()`.
3. The backend's `authenticate` middleware verifies the token on every protected route; `authorize(...roles)` further restricts admin-only endpoints.
4. A `401` (expired/invalid token) is caught automatically — the session is cleared and the user is redirected to `/login`.

---

## 🌐 Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Root: `frontend`, env: `VITE_API_URL` = backend URL |
| Backend | [Render](https://render.com) | Root: `backend`, env: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL` |

---

## 🗺 Roadmap

- [ ] Persist announcements, feedback, and audit logs to MongoDB (currently in-memory, resets on server restart)
- [ ] Cloud image storage (currently base64-encoded, stored inline — fine for a few small photos, not scalable long-term)
- [ ] Email notifications alongside in-app ones
- [ ] Server-side pagination & filtering for large complaint volumes
- [ ] Automated tests (backend routes, frontend components)

---

## 👤 Author

**Junaid Bin Jahangir**
CSE, International Islamic University Chittagong (IIUC) — Batch 2022–2026
[GitHub @junaidr04](https://github.com/junaidr04)

---

## 📄 License

This project is built for academic purposes as part of an IIUC group coursework project.