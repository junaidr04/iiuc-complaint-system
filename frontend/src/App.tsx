import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { Home } from './pages/public/Home';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';

// Student & Shared Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SubmitComplaint } from './pages/student/SubmitComplaint';
import { MyComplaints } from './pages/student/MyComplaints';
import { StudentProfile } from './pages/student/StudentProfile';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { ServicesPage } from './pages/shared/ServicesPage';
import { FeedbackPage } from './pages/shared/FeedbackPage';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageComplaints } from './pages/admin/ManageComplaints';
import { ManageDepartments } from './pages/admin/ManageDepartments';
import { ManageAnnouncements } from './pages/admin/ManageAnnouncements';
import { AuditLogs } from './pages/admin/AuditLogs';

function MainLayout() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle route protection when user state changes
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Unauthenticated users trying to access protected dashboards get routed to login
      const protectedPages = [
        'student-dashboard', 'submit-complaint', 'my-complaints', 'student-notifications',
        'student-feedback', 'staff-dashboard', 'assigned-complaints', 'admin-dashboard',
        'manage-users', 'manage-complaints', 'manage-departments', 'manage-announcements',
        'analytics-reports', 'audit-logs', 'profile'
      ];
      if (protectedPages.includes(currentPage)) {
        setCurrentPage('login');
      }
    } else {
      // Role-based protection: check if current page is valid for current user role
      if (user.role === 'student') {
        const studentForbidden = ['staff-dashboard', 'assigned-complaints', 'admin-dashboard', 'manage-users', 'manage-departments', 'manage-announcements', 'analytics-reports', 'audit-logs'];
        if (studentForbidden.includes(currentPage) || currentPage === 'login' || currentPage === 'register') {
          setCurrentPage('student-dashboard');
        }
      } else if (user.role === 'staff') {
        const staffForbidden = ['student-dashboard', 'submit-complaint', 'my-complaints', 'admin-dashboard', 'manage-users', 'manage-departments', 'manage-announcements', 'analytics-reports', 'audit-logs'];
        if (staffForbidden.includes(currentPage) || currentPage === 'login' || currentPage === 'register') {
          setCurrentPage('staff-dashboard');
        }
      } else if (user.role === 'admin') {
        const adminForbidden = ['student-dashboard', 'submit-complaint', 'my-complaints', 'staff-dashboard', 'assigned-complaints'];
        if (adminForbidden.includes(currentPage) || currentPage === 'login' || currentPage === 'register') {
          setCurrentPage('admin-dashboard');
        }
      }
    }
  }, [user, currentPage, isLoading]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-bold gap-2">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading CCMS Secure Engine...</span>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;

      // Student Pages
      case 'student-dashboard':
        return <StudentDashboard onNavigate={handleNavigate} />;
      case 'submit-complaint':
        return (
          <SubmitComplaint
            onNavigate={handleNavigate}
            onComplaintSubmitted={() => setCurrentPage('my-complaints')}
          />
        );
      case 'my-complaints':
        return <MyComplaints onNavigate={handleNavigate} />;
      case 'notifications':
      case 'student-notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'services':
      case 'campus-services':
        return <ServicesPage onNavigate={handleNavigate} />;
      case 'feedback':
      case 'student-feedback':
        return <FeedbackPage onNavigate={handleNavigate} />;
      case 'profile':
        return <StudentProfile />;

      // Staff Pages
      case 'staff-dashboard':
        return <StaffDashboard view="dashboard" onNavigate={handleNavigate} />;
      case 'assigned-complaints':
        return <StaffDashboard view="queue" onNavigate={handleNavigate} />;

      // Admin Pages
      case 'admin-dashboard':
      case 'analytics-reports':
        return <AdminDashboard />;
      case 'manage-users':
        return <ManageUsers />;
      case 'manage-complaints':
        return <ManageComplaints />;
      case 'manage-departments':
        return <ManageDepartments />;
      case 'manage-announcements':
        return <ManageAnnouncements />;
      case 'audit-logs':
        return <AuditLogs />;

      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar
        onSearch={(q) => setSearchQuery(q)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-4 md:p-6 min-w-0 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainLayout />
      </ThemeProvider>
    </AuthProvider>
  );
}