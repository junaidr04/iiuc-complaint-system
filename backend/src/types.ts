export type UserRole = 'student' | 'staff' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  department?: string;
  session?: string;
  phone?: string;
  studentIdNumber?: string;
  createdAt: string;
}

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus =
  | 'pending'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected';

export interface Remark {
  id: string;
  authorRole: UserRole | 'system';
  authorName: string;
  text: string;
  date: string;
}

export interface ComplaintRating {
  score: number; // 1-5
  comment?: string;
  date: string;
}

export interface AIAnalysisResult {
  predictedCategory: string;
  predictedPriority: PriorityLevel;
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  urgencyScore: number; // 0-100
  possibleDuplicates?: {
    id: string;
    title: string;
    status: ComplaintStatus;
    similarityScore: number;
  }[];
  smartSuggestions?: {
    title: string;
    solution: string;
  }[];
}

export interface Complaint {
  id: string; // e.g. CCMS-2026-8901
  title: string;
  description: string;
  departmentId: string;
  departmentName: string;
  category: string;
  building: string;
  roomNumber: string;
  imageUrls: string[];
  createdDate: string;
  updatedDate: string;
  isAnonymous: boolean;
  contactNumber?: string;
  location?: string;
  isEmergency: boolean;
  
  // Student info
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment?: string;
  
  // Assignment
  assignedStaffId?: string;
  assignedStaffName?: string;
  
  status: ComplaintStatus;
  priority: PriorityLevel;
  expectedCompletionDate?: string;
  
  remarks: Remark[];
  solutionImageUrls?: string[];
  solutionNotes?: string;
  
  rating?: ComplaintRating;
  aiAnalysis?: AIAnalysisResult;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headName: string;
  headEmail: string;
  description: string;
  staffCount: number;
  activeComplaintsCount: number;
}

export interface Category {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  description: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorRole: string;
  authorName: string;
  date: string;
  targetAudience: 'all' | 'students' | 'staff';
  isPinned: boolean;
  categoryTag?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_update' | 'assigned' | 'announcement' | 'action_required';
  complaintId?: string;
  read: boolean;
  date: string;
}

export interface FeedbackItem {
  id: string;
  studentId: string;
  studentName: string;
  complaintId?: string;
  complaintTitle?: string;
  rating: number; // 1-5
  category: string;
  comments: string;
  date: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
}

export interface CCMSStats {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  rejectedComplaints: number;
  criticalComplaints: number;
  avgResolutionDays: number;
  studentSatisfactionRate: number; // e.g. 94.2%
  departmentStats: { departmentName: string; total: number; resolved: number }[];
  monthlyTrend: { month: string; count: number; resolved: number }[];
  categoryDistribution: { category: string; count: number }[];
  priorityDistribution: { priority: PriorityLevel; count: number }[];
}
