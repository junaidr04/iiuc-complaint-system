import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SidebarNav } from './SidebarNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentRole(parsed.role || 'Student');
      } catch (e) {
        setCurrentRole('Student');
      }
    } else if (user) {
      setCurrentRole(user.role || 'Student');
    } else {
      setCurrentRole('Student');
    }
  }, [user]);

  if (loading || !currentRole) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <p className="text-lg font-medium animate-pulse">Loading UniCMS Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* বামপাশে মাত্র একটা স্ট্যাটিক সাইডবার থাকবে */}
      <SidebarNav />
      
      {/* ডানপাশে শুধুমাত্র মেইন পেজের কনটেন্ট রেন্ডার হবে */}
      <div className="flex-1 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}