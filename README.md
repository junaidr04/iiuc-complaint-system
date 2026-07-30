# IIUC Campus Complaint Management System (CCMS)

A full-stack MERN application that digitizes complaint handling for International Islamic University Chittagong (IIUC) — students raise and track complaints, staff resolve them by department, and admins get a full analytics and moderation console.

---

## ✨ Features

### Student
- Register / login with role-based auth
- Submit complaints with category, department, priority, and optional attachments
- **AI Smart Assistant** — Gemini-powered auto-categorization and priority suggestion while typing a complaint
- Track complaint status on a visual timeline (Submitted → In Progress → Resolved)
- Download a complaint receipt as a **PDF**, with an embedded **QR code** for quick lookup
- Submit feedback / satisfaction rating once a complaint is resolved
- In-app notifications for status changes

### Staff
- Department-scoped complaint queue
- Update complaint status, add resolution notes
- View assigned complaint history

### Admin / Super Admin
- Full analytics dashboard — ticket volume by category, department load, resolution trends
- Manage users (students/staff/admins), departments, and categories
- Publish and manage public announcements
- Full **audit log** of every state-changing action across the system (who did what, when)
- Moderate and oversee all complaints platform-wide

### Platform-wide
- **JWT-based authentication** — signed tokens issued on login/register, verified server-side on every protected request (no client-trusted claims)
- **Role-based route protection enforced on the backend** (student / staff / admin), not just hidden in the UI
- bcrypt password hashing
- Responsive UI with light/dark theme, mobile-safe navigation

---

## 🛠 Tech Stack

**Frontend** (`frontend/`)
- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- lucide-react (icons), motion (animations)
- jsPDF + jspdf-autotable (PDF export), qrcode (QR generation)

**Backend** (`backend/`)
- Node.js + Express
- MongoDB Atlas + Mongoose
- jsonwebtoken for auth, bcryptjs for password hashing
- Google Gemini API (`@google/genai`) for AI-assisted complaint triage
- tsx (dev), esbuild (production bundle)

**Dev tooling**
- Two independent npm workspaces (`frontend`, `backend`), connected via a Vite dev proxy (`/api` → `http://localhost:5000`)

---

## 📁 Project Structure

```
IIUC-Campus-Complaint/
├── frontend/                    React + Vite client
│   ├── src/
│   │   ├── components/          Reusable UI (layout, complaints, AI assistant)
│   │   ├── context/              Auth & theme context providers
│   │   ├── pages/                Route pages (public, student, staff, admin, shared)
│   │   └── utils/
│   │       ├── api.ts           apiFetch() — attaches JWT to every request, auto-logout on 401
│   │       ├── pdfGenerator.ts  PDF receipt generation
│   │       └── qrCode.ts        QR code generation
│   └── vite.config.ts
├── backend/                     Express + Mongoose API
│   ├── src/
│   │   ├── models/              Mongoose schemas (User, Complaint, Department, Category, Notification, AuditLog)
│   │   ├── middleware/
│   │   │   └── auth.ts          JWT issuing (generateToken), verification (authenticate), role guard (authorize)
│   │   ├── db.ts                MongoDB Atlas connection
│   │   ├── mockData.ts          Seed data (first-run auto-seed)
│   │   └── index.ts             Express app & all API routes
│   └── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free tier is fine)
- (Optional) A Google Gemini API key, for the AI Smart Assistant feature

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env     # fill in MONGODB_URI, JWT_SECRET (and GEMINI_API_KEY if you have one)
npm run dev               # http://localhost:5000
```

`JWT_SECRET` should be a long random string — it signs and verifies every login session. Never commit the real value; only `.env.example` (with placeholders) is meant to be pushed to GitHub.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

The frontend's Vite dev server proxies every `/api/*` call to the backend, so no extra config is needed to connect them locally.

### 3. Login
The backend auto-seeds an admin account on first successful DB connection:
```
Email: admin@campus.com
Password: Admin@123
```
Or register a new student account from the UI.

---

## 🔐 Authentication

- Login/register issue a signed JWT (7-day expiry) containing the user's id, role, name, and email.
- The frontend stores the token in `localStorage` and attaches it as `Authorization: Bearer <token>` on every request via `apiFetch()`.
- The backend's `authenticate` middleware verifies the token on every protected route; `authorize(...roles)` further restricts admin-only routes (user management, department/category creation, audit logs, platform stats).
- An expired or invalid token gets a `401`, which `apiFetch()` catches to clear the session and redirect to `/login` automatically.

---

## 🌐 Deployment

- **Backend** → Render (Node web service). Set `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL` as environment variables.
- **Frontend** → Vercel (static build via `npm run build`, output in `frontend/dist`).
- Point the deployed frontend's API calls at the deployed backend URL (or configure an equivalent rewrite/proxy on the host).

---

## 🗺 Roadmap

- [ ] Persist announcements, feedback, and audit logs to MongoDB (currently in-memory, resets on server restart)
- [ ] File/image attachments on complaints (currently text-only)
- [ ] Email notifications alongside in-app ones
- [ ] Pagination & server-side filtering for large complaint volumes
- [ ] Automated tests (backend route tests, frontend component tests)

---

## 👤 Author

**Junaid Bin Jahangir**
CSE, International Islamic University Chittagong (IIUC) — Batch 2022–2026
GitHub: [@junaidr04](https://github.com/junaidr04)