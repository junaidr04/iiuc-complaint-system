import axios from 'axios';

// Axios Instance - Using explicit 127.0.0.1 to avoid Windows localhost bug
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for LocalStorage JWT tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Exporting All Required Functions ---

// Notifications API
export const getNotifications = () => api.get('/notifications').then(res => res.data);
export const markNotificationRead = (id: string) => api.patch(`/notifications/${id}/read`).then(res => res.data);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all').then(res => res.data);
export const createNotification = (data: any) => api.post('/notifications', data).then(res => res.data);

// Complaints API
export const getAllComplaints = () => api.get('/complaints').then(res => res.data);
export const getMyComplaints = () => api.get('/complaints/my').then(res => res.data);
export const getComplaintById = (id: string) => api.get(`/complaints/${id}`).then(res => res.data);
export const createComplaint = (data: any) => api.post('/complaints', data).then(res => res.data);
export const updateComplaintStatus = (id: string, status: string) => api.patch(`/complaints/${id}/status`, { status }).then(res => res.data);
export const deleteComplaint = (id: string) => api.delete(`/complaints/${id}`).then(res => res.data);
export const assignComplaintToAuthority = (id: string, authorityId: string) => api.patch(`/complaints/${id}/assign`, { authorityId }).then(res => res.data);
export const toggleUpvote = (id: string) => api.post(`/complaints/${id}/upvote`).then(res => res.data);
export const addComment = (id: string, comment: string) => api.post(`/complaints/${id}/comments`, { comment }).then(res => res.data);
export const uploadComplaintImage = (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/complaints/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
};
export const getAssignedComplaints = () => api.get('/complaints/assigned').then(res => res.data);

// Departments API
export const getDepartments = () => api.get('/departments').then(res => res.data);

// Users & Admin Dashboard Stats API
export const getAllUsers = () => api.get('/users').then(res => res.data);
export const updateUserRole = (id: string, role: string) => api.patch(`/users/${id}/role`, { role }).then(res => res.data);
export const deleteUser = (id: string) => api.delete(`/users/${id}`).then(res => res.data);
export const getSystemStats = () => api.get('/stats/system').then(res => res.data);
export const getAnalyticsData = () => api.get('/stats/analytics').then(res => res.data);
export const getStudentStats = () => api.get('/stats/student').then(res => res.data);

export default api;