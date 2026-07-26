import { User, Department, Category, Complaint, Announcement, AppNotification, FeedbackItem, AuditLog } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'System Admin',
    email: 'admin@campus.com',
    role: 'admin',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Central Administration',
    phone: '+1 (555) 999-0000',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-staff-1',
    name: 'Campus Maintenance Staff',
    email: 'staff@campus.com',
    role: 'staff',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Facilities & Campus Maintenance',
    phone: '+1 (555) 888-0011',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-student-1',
    name: 'Alex Rivera',
    email: 'student@campus.com',
    role: 'student',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    session: '2023-2027',
    phone: '+1 (555) 234-5678',
    studentIdNumber: 'CSE-2023-089',
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-it',
    name: 'IT & Network Services',
    code: 'ITNET',
    headName: 'Dr. Marcus Vance',
    headEmail: 'marcus.vance@campus.com',
    description: 'Campus WiFi, computer labs, university portal, LMS, server infrastructure, and network connectivity.',
    staffCount: 5,
    activeComplaintsCount: 0,
  },
  {
    id: 'dept-maint',
    name: 'Facilities & Campus Maintenance',
    code: 'FACM',
    headName: 'Engr. Sarah Jenkins',
    headEmail: 'sarah.jenkins@campus.com',
    description: 'Electrical fixtures, plumbing, water supply, air conditioning, civil repairs, washroom upkeep.',
    staffCount: 8,
    activeComplaintsCount: 0,
  },
  {
    id: 'dept-hostel',
    name: 'Hostel & Residential Services',
    code: 'HSTL',
    headName: 'Dr. Evelyn Harper',
    headEmail: 'evelyn.harper@campus.com',
    description: 'Student residence halls, dining messes, room allotment, water purifiers, hostel security.',
    staffCount: 6,
    activeComplaintsCount: 0,
  },
  {
    id: 'dept-acad',
    name: 'Academic Affairs & Classrooms',
    code: 'ACAD',
    headName: 'Prof. Robert Taylor',
    headEmail: 'robert.taylor@campus.com',
    description: 'Classroom projectors, whiteboards, podiums, audio systems, lecture scheduling & hall acoustics.',
    staffCount: 4,
    activeComplaintsCount: 0,
  },
  {
    id: 'dept-sec',
    name: 'Campus Security & Safety',
    code: 'SECU',
    headName: 'Capt. Richard Thorne',
    headEmail: 'richard.thorne@campus.com',
    description: 'CCTV surveillance, gate pass validation, emergency response, night patrols, lost & found.',
    staffCount: 10,
    activeComplaintsCount: 0,
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-wifi', name: 'Internet/WiFi', departmentId: 'dept-it', departmentName: 'IT & Network Services', description: 'Slow connection, router failure, portal authentication issues, captive portal' },
  { id: 'cat-class', name: 'Classroom', departmentId: 'dept-acad', departmentName: 'Academic Affairs & Classrooms', description: 'Projector malfunction, broken chairs, audio mic noise, podium AC' },
  { id: 'cat-lab', name: 'Laboratory', departmentId: 'dept-it', departmentName: 'IT & Network Services', description: 'Lab PC crashing, software license expired, lab equipment defect' },
  { id: 'cat-elec', name: 'Electrical', departmentId: 'dept-maint', departmentName: 'Facilities & Campus Maintenance', description: 'Power outage, burnt light bulbs, socket short-circuit, ceiling fan noise' },
  { id: 'cat-water', name: 'Water Supply', departmentId: 'dept-maint', departmentName: 'Facilities & Campus Maintenance', description: 'No water in taps, water purifier filter dirty, leakages, hot water supply' },
  { id: 'cat-wash', name: 'Washroom', departmentId: 'dept-maint', departmentName: 'Facilities & Campus Maintenance', description: 'Sanitation issues, clogged drains, missing soap dispensers, flush defect' },
  { id: 'cat-hostel', name: 'Hostel', departmentId: 'dept-hostel', departmentName: 'Hostel & Residential Services', description: 'Bed frame defect, door lock broken, noise complaint, room pest control' },
  { id: 'cat-cafe', name: 'Cafeteria', departmentId: 'dept-hostel', departmentName: 'Hostel & Residential Services', description: 'Food quality, hygiene, pricing discrepancy, seating cleanliness' },
  { id: 'cat-sec', name: 'Security', departmentId: 'dept-sec', departmentName: 'Campus Security & Safety', description: 'Unauthorized entrants, unlit parking areas, tailgating, CCTV request' }
];

export const INITIAL_COMPLAINTS: Complaint[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_FEEDBACKS: FeedbackItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
