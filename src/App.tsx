import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layout
import AppLayout from './components/layouts/AppLayout';

// Pages Import
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotificationsPage from './pages/NotificationsPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import SubmitComplaintPage from './pages/student/SubmitComplaintPage';
import MyComplaintsPage from './pages/student/MyComplaintsPage';
import ComplaintDetailsPage from './pages/student/ComplaintDetailsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import UsersPage from './pages/admin/UsersPage';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';

// Authority Pages
import AuthorityDashboard from './pages/authority/AuthorityDashboard';

// Role-Based Dashboard Picker Component
function InitialDashboard() {
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = savedUser?.role || 'Student';

  if (role === 'Admin') return <AdminDashboard />;
  if (role === 'Authority') return <AuthorityDashboard />;
  return <StudentDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ১. পাবলিক অথ রাউটস (লেআউট ছাড়া) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ২. কোর ড্যাশবোর্ড রাউটস (সবগুলো AppLayout এর ভেতরে থাকবে) */}
          <Route path="/" element={<AppLayout><InitialDashboard /></AppLayout>} />
          <Route path="/notifications" element={<AppLayout><NotificationsPage /></AppLayout>} />
          
          {/* স্টুডেন্ট প্যানেল */}
          <Route path="/submit-complaint" element={<AppLayout><SubmitComplaintPage /></AppLayout>} />
          <Route path="/my-complaints" element={<AppLayout><MyComplaintsPage /></AppLayout>} />
          <Route path="/complaints/:id" element={<AppLayout><ComplaintDetailsPage /></AppLayout>} />

          {/* অ্যাডমিন প্যানেল */}
          <Route path="/admin/analytics" element={<AppLayout><AnalyticsPage /></AppLayout>} />
          <Route path="/admin/users" element={<AppLayout><UsersPage /></AppLayout>} />
          <Route path="/admin/complaints" element={<AppLayout><AdminComplaintsPage /></AppLayout>} />

          {/* ক্যাচ-অল ফলব্যাক */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}