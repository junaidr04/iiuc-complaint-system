import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import AuthCallback from '@/pages/auth/AuthCallback';

// Student pages
import StudentDashboard from '@/pages/student/StudentDashboard';
import SubmitComplaintPage from '@/pages/student/SubmitComplaintPage';
import MyComplaintsPage from '@/pages/student/MyComplaintsPage';
import ComplaintDetailsPage from '@/pages/student/ComplaintDetailsPage';

// Authority pages
import AuthorityDashboard from '@/pages/authority/AuthorityDashboard';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminComplaintsPage from '@/pages/admin/AdminComplaintsPage';
import DepartmentsPage from '@/pages/admin/DepartmentsPage';
import UsersPage from '@/pages/admin/UsersPage';
import AnalyticsPage from '@/pages/admin/AnalyticsPage';

// Common pages
import NotificationsPage from '@/pages/NotificationsPage';

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
        <IntersectObserver />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Student routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/submit" element={<ProtectedRoute allowedRoles={['student']}><SubmitComplaintPage /></ProtectedRoute>} />
          <Route path="/dashboard/complaints" element={<ProtectedRoute allowedRoles={['student']}><MyComplaintsPage /></ProtectedRoute>} />
          <Route path="/dashboard/complaints/:id" element={<ProtectedRoute allowedRoles={['student']}><ComplaintDetailsPage /></ProtectedRoute>} />

          {/* Authority routes */}
          <Route path="/authority" element={<ProtectedRoute allowedRoles={['authority']}><AuthorityDashboard /></ProtectedRoute>} />
          <Route path="/authority/complaints" element={<ProtectedRoute allowedRoles={['authority']}><AuthorityDashboard /></ProtectedRoute>} />
          <Route path="/authority/complaints/:id" element={<ProtectedRoute allowedRoles={['authority']}><ComplaintDetailsPage /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={['admin']}><AdminComplaintsPage /></ProtectedRoute>} />
          <Route path="/admin/complaints/:id" element={<ProtectedRoute allowedRoles={['admin']}><ComplaintDetailsPage /></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin']}><DepartmentsPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AnalyticsPage /></ProtectedRoute>} />

          {/* Shared protected routes */}
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
