import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar, TopNavbar } from '@/components/layouts/SidebarNav';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications } from '@/services/api';
import { supabase } from '@/db/supabase';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/submit': 'Submit Complaint',
  '/dashboard/complaints': 'My Complaints',
  '/authority': 'Authority Dashboard',
  '/authority/complaints': 'Assigned Complaints',
  '/admin': 'Admin Dashboard',
  '/admin/complaints': 'All Complaints',
  '/admin/departments': 'Departments',
  '/admin/users': 'Users',
  '/admin/analytics': 'Analytics',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
};

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { profile } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get page title
  let title = 'University CMS';
  for (const [path, t] of Object.entries(PAGE_TITLES)) {
    if (location.pathname === path || location.pathname.startsWith(path + '/')) {
      title = t;
      break;
    }
  }
  if (location.pathname.startsWith('/dashboard/complaints/')) title = 'Complaint Details';
  if (location.pathname.startsWith('/authority/complaints/')) title = 'Complaint Details';
  if (location.pathname.startsWith('/admin/complaints/')) title = 'Complaint Details';

  // Load unread notification count
  useEffect(() => {
    if (!profile?.id) return;
    getNotifications(profile.id).then(notifs => {
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    });

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:${profile.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `receiver_id=eq.${profile.id}` },
        () => setUnreadCount(prev => prev + 1)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `receiver_id=eq.${profile.id}` },
        (payload) => {
          if ((payload.new as { is_read: boolean }).is_read) setUnreadCount(prev => Math.max(0, prev - 1));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar
        unreadCount={unreadCount}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        <TopNavbar
          title={title}
          onMenuClick={() => setMobileMenuOpen(true)}
          unreadCount={unreadCount}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
