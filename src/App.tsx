import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';
// আপনার প্রজেক্টের বাকি পেজগুলো এখানে ইম্পোর্ট করা থাকবে...

export default function App() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // লোকাল স্টোরেজ থেকে রোল রিড করা হচ্ছে
    const savedRole = localStorage.getItem('user_role');
    setRole(savedRole);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* লগইন রাউট */}
        <Route path="/login" element={<LoginPage />} />

        {/* স্টুডেন্ট প্যানেল প্রোটেকশন */}
        <Route 
          path="/student/dashboard" 
          element={
            role === 'Student' ? <StudentDashboard /> : <Navigate to="/login" replace />
          } 
        />

        {/* অ্যাডমিন ও অথরিটি প্যানেল প্রোটেকশন */}
        <Route 
          path="/admin/complaints" 
          element={
            role === 'Admin' || role === 'Authority' ? <AdminComplaintsPage /> : <Navigate to="/login" replace />
          } 
        />

        {/* ডিফল্ট রুট হ্যান্ডলিং */}
        <Route 
          path="*" 
          element={
            role ? (
              role === 'Student' ? <Navigate to="/student/dashboard" replace /> : <Navigate to="/admin/complaints" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}