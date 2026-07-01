import { supabase } from '@/db/supabase';
import type {
  User, Complaint, Department, Notification, Comment,
  ComplaintTimeline, ComplaintFilters, ComplaintFormData, UserRole,
  SystemStats, ComplaintStats
} from '@/types/types';

const PAGE_SIZE = 10;

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getMyProfile(userId: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('*, department:departments(id,name)')
    .eq('id', userId)
    .maybeSingle();
  return data as User | null;
}

export async function getAllUsers(search?: string): Promise<User[]> {
  let q = supabase
    .from('users')
    .select('*, department:departments(id,name)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (search) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  const { data } = await q;
  return Array.isArray(data) ? (data as User[]) : [];
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  await supabase.from('users').update({ role }).eq('id', userId);
}

export async function deleteUser(userId: string): Promise<void> {
  await supabase.from('users').delete().eq('id', userId);
}

export async function updateProfile(userId: string, updates: Partial<User>): Promise<void> {
  await supabase.from('users').update(updates).eq('id', userId);
}

// ─── Departments ─────────────────────────────────────────────────────────────

export async function getDepartments(): Promise<Department[]> {
  const { data } = await supabase
    .from('departments')
    .select('*, assigned_authority:users!departments_assigned_authority_id_fkey(id,name,email)')
    .order('name', { ascending: true });
  return Array.isArray(data) ? (data as Department[]) : [];
}

export async function createDepartment(dept: { name: string; description?: string }): Promise<void> {
  await supabase.from('departments').insert(dept);
}

export async function updateDepartment(id: string, updates: Partial<Department>): Promise<void> {
  await supabase.from('departments').update(updates).eq('id', id);
}

export async function deleteDepartment(id: string): Promise<void> {
  await supabase.from('departments').delete().eq('id', id);
}

export async function assignAuthority(departmentId: string, authorityId: string | null): Promise<void> {
  await supabase.from('departments').update({ assigned_authority_id: authorityId }).eq('id', departmentId);
}

// ─── Complaints ──────────────────────────────────────────────────────────────

export async function getMyComplaints(
  userId: string,
  filters: ComplaintFilters,
  page = 1
): Promise<{ data: Complaint[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let q = supabase
    .from('complaints')
    .select('*, department:departments(id,name), creator:users!complaints_created_by_fkey(id,name)', { count: 'exact' })
    .eq('created_by', userId);

  if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status);
  if (filters.department_id) q = q.eq('department_id', filters.department_id);
  if (filters.search) q = q.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

  if (filters.sort === 'oldest') q = q.order('created_at', { ascending: true });
  else if (filters.sort === 'upvotes') q = q.order('upvote_count', { ascending: false });
  else q = q.order('created_at', { ascending: false });

  q = q.range(from, to);

  const { data, count } = await q;
  return { data: Array.isArray(data) ? (data as Complaint[]) : [], total: count ?? 0 };
}

export async function getAllComplaints(
  filters: ComplaintFilters,
  page = 1
): Promise<{ data: Complaint[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let q = supabase
    .from('complaints')
    .select('*, department:departments(id,name), creator:users!complaints_created_by_fkey(id,name)', { count: 'exact' });

  if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status);
  if (filters.department_id) q = q.eq('department_id', filters.department_id);
  if (filters.search) q = q.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

  if (filters.sort === 'oldest') q = q.order('created_at', { ascending: true });
  else if (filters.sort === 'upvotes') q = q.order('upvote_count', { ascending: false });
  else q = q.order('created_at', { ascending: false });

  q = q.range(from, to);

  const { data, count } = await q;
  return { data: Array.isArray(data) ? (data as Complaint[]) : [], total: count ?? 0 };
}

export async function getAssignedComplaints(
  authorityId: string,
  filters: ComplaintFilters,
  page = 1
): Promise<{ data: Complaint[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Authority sees complaints in their department
  let q = supabase
    .from('complaints')
    .select('*, department:departments(id,name), creator:users!complaints_created_by_fkey(id,name)', { count: 'exact' })
    .or(`assigned_authority_id.eq.${authorityId},department_id.in.(select id from departments where assigned_authority_id = '${authorityId}')`);

  if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status);
  if (filters.search) q = q.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

  if (filters.sort === 'oldest') q = q.order('created_at', { ascending: true });
  else if (filters.sort === 'upvotes') q = q.order('upvote_count', { ascending: false });
  else q = q.order('created_at', { ascending: false });

  q = q.range(from, to);

  const { data, count } = await q;
  return { data: Array.isArray(data) ? (data as Complaint[]) : [], total: count ?? 0 };
}

export async function getComplaintById(id: string, userId?: string): Promise<Complaint | null> {
  const { data } = await supabase
    .from('complaints')
    .select(`
      *,
      department:departments(id,name),
      creator:users!complaints_created_by_fkey(id,name,profile_image),
      comments(id,content,created_at,author:users!comments_author_id_fkey(id,name,profile_image)),
      complaint_timeline(id,status,note,created_at,changed_by_user:users!complaint_timeline_changed_by_fkey(id,name))
    `)
    .eq('id', id)
    .maybeSingle();

  if (!data) return null;
  const complaint = data as Complaint;

  // Check if current user upvoted
  if (userId) {
    const { data: upvote } = await supabase
      .from('upvotes')
      .select('id')
      .eq('complaint_id', id)
      .eq('user_id', userId)
      .maybeSingle();
    complaint.user_upvoted = !!upvote;
  }

  return complaint;
}

export async function createComplaint(data: Omit<ComplaintFormData, 'image'> & { image_url?: string; created_by: string }): Promise<string | null> {
  const { data: result, error } = await supabase
    .from('complaints')
    .insert({
      title: data.title,
      category: data.category,
      description: data.description,
      department_id: data.department_id || null,
      is_anonymous: data.is_anonymous,
      image_url: data.image_url || null,
      created_by: data.created_by,
    })
    .select('id')
    .maybeSingle();

  if (error) return null;

  // Insert initial timeline entry
  if (result?.id) {
    await supabase.from('complaint_timeline').insert({
      complaint_id: result.id,
      status: 'pending',
      changed_by: data.created_by,
      note: 'Complaint submitted',
    });
  }

  return result?.id ?? null;
}

export async function updateComplaintStatus(
  complaintId: string,
  status: 'pending' | 'in_review' | 'resolved',
  changedBy: string,
  note?: string
): Promise<void> {
  await supabase.from('complaints').update({ status }).eq('id', complaintId);
  await supabase.from('complaint_timeline').insert({
    complaint_id: complaintId,
    status,
    changed_by: changedBy,
    note: note || null,
  });
}

export async function assignComplaintToAuthority(complaintId: string, authorityId: string): Promise<void> {
  await supabase.from('complaints').update({ assigned_authority_id: authorityId }).eq('id', complaintId);
}

export async function deleteComplaint(id: string): Promise<void> {
  await supabase.from('complaints').delete().eq('id', id);
}

// ─── Upvotes ─────────────────────────────────────────────────────────────────

export async function toggleUpvote(complaintId: string, userId: string, currentlyUpvoted: boolean): Promise<void> {
  if (currentlyUpvoted) {
    await supabase.from('upvotes').delete().eq('complaint_id', complaintId).eq('user_id', userId);
  } else {
    await supabase.from('upvotes').insert({ complaint_id: complaintId, user_id: userId });
  }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function addComment(complaintId: string, authorId: string, content: string): Promise<Comment | null> {
  const { data } = await supabase
    .from('comments')
    .insert({ complaint_id: complaintId, author_id: authorId, content })
    .select('*, author:users!comments_author_id_fkey(id,name,profile_image)')
    .maybeSingle();
  return data as Comment | null;
}

export async function getComments(complaintId: string): Promise<Comment[]> {
  const { data } = await supabase
    .from('comments')
    .select('*, author:users!comments_author_id_fkey(id,name,profile_image)')
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true })
    .limit(50);
  return Array.isArray(data) ? (data as Comment[]) : [];
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return Array.isArray(data) ? (data as Notification[]) : [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('receiver_id', userId);
}

export async function createNotification(params: {
  receiver_id: string;
  complaint_id?: string;
  message: string;
  type: string;
}): Promise<void> {
  await supabase.from('notifications').insert(params);
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getStudentStats(userId: string): Promise<ComplaintStats> {
  const { data } = await supabase
    .from('complaints')
    .select('status')
    .eq('created_by', userId);

  const list = Array.isArray(data) ? data : [];
  return {
    total: list.length,
    pending: list.filter(c => c.status === 'pending').length,
    inReview: list.filter(c => c.status === 'in_review').length,
    resolved: list.filter(c => c.status === 'resolved').length,
  };
}

export async function getSystemStats(): Promise<SystemStats> {
  const [complaints, users, departments] = await Promise.all([
    supabase.from('complaints').select('status'),
    supabase.from('users').select('id', { count: 'exact' }),
    supabase.from('departments').select('id', { count: 'exact' }),
  ]);

  const list = Array.isArray(complaints.data) ? complaints.data : [];
  return {
    totalComplaints: list.length,
    pending: list.filter(c => c.status === 'pending').length,
    inReview: list.filter(c => c.status === 'in_review').length,
    resolved: list.filter(c => c.status === 'resolved').length,
    totalUsers: users.count ?? 0,
    totalDepartments: departments.count ?? 0,
  };
}

export async function getAnalyticsData(): Promise<{
  byStatus: { name: string; value: number }[];
  byDepartment: { name: string; count: number }[];
  byMonth: { month: string; complaints: number; resolved: number }[];
}> {
  const { data: complaints } = await supabase
    .from('complaints')
    .select('status, department_id, created_at, department:departments(name)')
    .order('created_at', { ascending: true })
    .limit(1000);

  const list = Array.isArray(complaints) ? complaints : [];

  // Status distribution
  const pending = list.filter(c => c.status === 'pending').length;
  const inReview = list.filter(c => c.status === 'in_review').length;
  const resolved = list.filter(c => c.status === 'resolved').length;
  const byStatus = [
    { name: 'Pending', value: pending },
    { name: 'In Review', value: inReview },
    { name: 'Resolved', value: resolved },
  ];

  // Department distribution
  const deptMap: Record<string, number> = {};
  for (const c of list) {
    const deptName = (c.department as { name?: string })?.name ?? 'Unknown';
    deptMap[deptName] = (deptMap[deptName] || 0) + 1;
  }
  const byDepartment = Object.entries(deptMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Monthly trends (last 6 months)
  const monthMap: Record<string, { complaints: number; resolved: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthMap[key] = { complaints: 0, resolved: 0 };
  }
  for (const c of list) {
    const d = new Date(c.created_at as string);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (monthMap[key]) {
      monthMap[key].complaints += 1;
      if (c.status === 'resolved') monthMap[key].resolved += 1;
    }
  }
  const byMonth = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }));

  return { byStatus, byDepartment, byMonth };
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

export async function uploadComplaintImage(file: File, userId: string): Promise<string | null> {
  const compressedFile = await compressImage(file);
  const safeName = `${userId}/${Date.now()}_complaint.webp`;

  const { data, error } = await supabase.storage
    .from('complaint-images')
    .upload(safeName, compressedFile, { contentType: 'image/webp', upsert: true });

  if (error || !data) return null;

  const { data: urlData } = supabase.storage.from('complaint-images').getPublicUrl(data.path);
  return urlData.publicUrl;
}

async function compressImage(file: File, maxSizeBytes = 1024 * 1024, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX_DIM = 1920;
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      const tryCompress = (q: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size <= maxSizeBytes || q <= 0.2) {
              resolve(blob);
            } else {
              tryCompress(q - 0.1);
            }
          },
          'image/webp',
          q
        );
      };
      tryCompress(quality);
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}
