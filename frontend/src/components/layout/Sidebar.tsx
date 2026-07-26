import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Bell,
  MessageSquareHeart,
  User,
  Users,
  Building2,
  ListFilter,
  Megaphone,
  BarChart3,
  History,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Wrench,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const studentNav: NavItem[] = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'submit-complaint', label: 'Submit Complaint', icon: PlusCircle, highlight: true },
    { id: 'my-complaints', label: 'My Complaints', icon: FileText },
    { id: 'campus-services', label: 'Campus Services', icon: Wrench },
    { id: 'student-notifications', label: 'Notifications', icon: Bell },
    { id: 'student-feedback', label: 'Service Feedback', icon: MessageSquareHeart },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const staffNav: NavItem[] = [
    { id: 'staff-dashboard', label: 'Staff Dashboard', icon: LayoutDashboard },
    { id: 'assigned-complaints', label: 'Assigned Complaints', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const adminNav: NavItem[] = [
    { id: 'admin-dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'manage-users', label: 'Users & Staff', icon: Users },
    { id: 'manage-complaints', label: 'Complaint Desk', icon: FileText },
    { id: 'manage-departments', label: 'Departments & Cats', icon: Building2 },
    { id: 'manage-announcements', label: 'Announcements', icon: Megaphone },
    { id: 'analytics-reports', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'audit-logs', label: 'Audit & Feedbacks', icon: History },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'staff' ? staffNav : studentNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed md:sticky top-14 left-0 z-40 w-64 h-[calc(100vh-3.5rem)] bg-slate-900 text-white border-r border-slate-800 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto">
          {/* Active Role Indicator Card */}
          <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Current Session
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white capitalize flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-rose-500 animate-pulse' : role === 'staff' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                  {user?.name || 'Active User'}
                </p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5 capitalize">{role} • Active</p>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Navigation Menu
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                      : item.highlight
                      ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Quick Action: Emergency Hotline */}
        <div className="pt-4 border-t border-slate-800">
          <div className="p-3 bg-rose-950/50 border border-rose-900/80 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" /> Emergency Control
            </div>
            <p className="text-[11px] text-rose-300/80">
              Campus Security Hotline:
            </p>
            <a
              href="tel:+15559990000"
              className="font-mono font-bold text-rose-200 block hover:underline"
            >
              +1 (555) 999-0000
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
