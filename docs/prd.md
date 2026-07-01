# University Complaint Management System

A web-based complaint management platform for universities. Students can submit and track complaints, authorities can manage and resolve complaints assigned to their department, and administrators can oversee the entire system with full user, department, and analytics control.

---

## 📋 Overview

| | |
|---|---|
| **Application Name** | University Complaint Management System |
| **Type** | Full-stack Web Application |
| **Users** | Students, Authorities, Administrators |
| **Core Purpose** | Streamline complaint submission, assignment, resolution, and tracking within a university ecosystem |

---

## 👥 User Roles

### 🎓 Student
- Submit complaints with title, category, description, department, and optional image
- Track complaint status in real time (Pending → In Review → Resolved)
- View complaint timeline and comments
- Upvote complaints, submit anonymously
- Receive real-time notifications

### 🛡️ Authority
- View complaints assigned to their department
- Update complaint status
- Add comments to complaints
- Search, filter, and sort assigned complaints

### 👑 Admin (Super Admin)
- View system-wide statistics and analytics
- Manage all complaints (view, search, filter, assign to authorities)
- Manage departments (create, edit, delete, assign authority)
- Manage users (view, search, filter, change role, delete)
- View analytics: status distribution, department-wise counts, monthly trends

---

## 🗂️ Page Structure

```
├── Authentication
│   ├── Registration Page
│   ├── Login Page
│   └── Google Sign-In
├── Student Portal
│   ├── Dashboard
│   ├── Submit Complaint
│   ├── My Complaints
│   └── Complaint Details
├── Authority Portal
│   ├── Dashboard
│   └── Assigned Complaints Management
├── Admin Portal
│   ├── Dashboard
│   ├── All Complaints
│   ├── Department Management
│   ├── User Management
│   └── System Analytics
└── Common Components
    ├── Sidebar Navigation
    ├── Top Navbar
    └── Notification Center
```

---

## ⚙️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Recharts (for analytics charts)
- **Backend:** Node.js / Express (assumed — update to match actual stack)
- **Database:** MongoDB (assumed — update to match actual stack)
- **Auth:** Firebase Authentication (Email/Password + Google Sign-In)
- **Image Upload:** Cloudinary
- **Real-time:** Socket.io (notifications, live status updates)

> ⚠️ Update the Backend/Database rows above to match your team's actual implementation.

---

## 🔑 Core Business Rules

- **Complaint Lifecycle:** `Pending → In Review → Resolved`. Only the assigned authority can update status.
- **Anonymous Complaints:** Hides student identity from authorities; student and admin can still view the identity.
- **Upvoting:** Each student can upvote a complaint once; cannot upvote their own complaint.
- **Department Assignment:** Each complaint belongs to one department; each department has one assigned authority.
- **Notifications:** Delivered in real time via Socket.io, persisted in DB, shown with unread badge count.
- **Image Upload:** One image per complaint, stored via Cloudinary.
- **Role-based Access:** One role per user (Student / Authority / Admin); protected routes enforce access via Firebase token verification.

---

## 🚫 Out of Scope (This Release)

Email/SMS notifications, multi-language support, complaint priority levels, escalation workflow, reassignment between authorities, bulk operations, AI-based analytics, native mobile apps, multiple attachments, complaint templates, scheduled reports, external ticketing integration, public complaint viewing, complaint merging, custom notification preferences, complaint archiving, individual data export.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Firebase project (for Auth)
- Cloudinary account (for image uploads)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd university-complaint-management-system

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Create a `.env` file in the `client/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
```

### Run Locally

```bash
# Start backend
cd server
npm run dev

# Start frontend (in a new terminal)
cd client
npm run dev
```

---

## 📁 Project Structure (Suggested)

```
university-complaint-management-system/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Sidebar, Navbar, Notification Center
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   ├── authority/
│   │   │   └── admin/
│   │   ├── guards/           # Role-based route guards
│   │   ├── context/
│   │   └── utils/
│   └── package.json
├── server/                  # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/           # Auth verification, role checks
│   └── package.json
└── README.md
```

---

## ✅ Acceptance Criteria (Sample Flow)

1. Student registers and logs in successfully.
2. Student submits a complaint with required fields and an image.
3. Complaint appears in **My Complaints** with status `Pending`.
4. Authority views the complaint in their dashboard and updates status to `In Review`.
5. Student receives a real-time notification of the status change.
6. Authority resolves the complaint (`Resolved`).
7. Student views the complaint details page showing `Resolved` status and full timeline.

---

## 👨‍💻 Team

- **Admin/Authority UI, Super Admin Panel, Analytics (Recharts), Role-based UI Guards** — *[Your Name]*
- *(Add other team members and their responsibilities here)*

---

## 📄 License

This project is developed as part of a university coursework requirement. License terms to be decided by the team.
