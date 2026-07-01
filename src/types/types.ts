// Core type definitions matching the database schema

export type UserRole = 'student' | 'authority' | 'admin';
export type ComplaintStatus = 'pending' | 'in_review' | 'resolved';
export type NotificationType = 'status_change' | 'new_comment' | 'assigned' | 'resolved';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  assigned_authority_id: string | null;
  created_at: string;
  updated_at: string;
  assigned_authority?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department_id: string | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  is_anonymous: boolean;
  department_id: string | null;
  status: ComplaintStatus;
  created_by: string;
  assigned_authority_id: string | null;
  upvote_count: number;
  created_at: string;
  updated_at: string;
  department?: Department;
  creator?: User;
  assigned_authority?: User;
  comments?: Comment[];
  timeline?: ComplaintTimeline[];
  complaint_timeline?: ComplaintTimeline[];
  user_upvoted?: boolean;
}

export interface Upvote {
  id: string;
  complaint_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  complaint_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: User;
}

export interface ComplaintTimeline {
  id: string;
  complaint_id: string;
  status: ComplaintStatus;
  changed_by: string;
  note: string | null;
  created_at: string;
  changed_by_user?: User;
}

export interface Notification {
  id: string;
  receiver_id: string;
  complaint_id: string | null;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  complaint?: { title: string };
}

// Form types
export interface ComplaintFormData {
  title: string;
  category: string;
  description: string;
  department_id: string;
  is_anonymous: boolean;
  image?: File | null;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department_id?: string;
}

// Pagination
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface ComplaintFilters {
  status?: ComplaintStatus | 'all';
  department_id?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'upvotes';
}

// Stats
export interface SystemStats {
  totalComplaints: number;
  pending: number;
  inReview: number;
  resolved: number;
  totalUsers: number;
  totalDepartments: number;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
}

// Category options
export const COMPLAINT_CATEGORIES = [
  'Academic Issue',
  'Facilities',
  'Faculty Conduct',
  'Administration',
  'Financial',
  'IT Services',
  'Library',
  'Health & Safety',
  'Transportation',
  'Harassment',
  'Other',
] as const;
