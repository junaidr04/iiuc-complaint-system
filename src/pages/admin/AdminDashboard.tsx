import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSystemStats, getNotifications } from '@/services/api';
import type { SystemStats } from '@/types/types';
import AppLayout from '@/components/layouts/AppLayout';
import { Link } from 'react-router-dom';
import { FileText, Users, Building2, Clock, Eye, CheckCircle, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCardSkeleton } from '@/components/common/Skeletons';

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSystemStats().then(s => { setStats(s); setLoading(false); });
  }, []);

  const statCards = stats ? [
    { label: 'Total Complaints', value: stats.totalComplaints, icon: <FileText className="h-5 w-5 text-primary" />, accent: 'bg-primary/10', href: '/admin/complaints' },
    { label: 'Pending', value: stats.pending, icon: <Clock className="h-5 w-5 text-status-pending" />, accent: 'bg-status-pending', href: '/admin/complaints?status=pending' },
    { label: 'In Review', value: stats.inReview, icon: <Eye className="h-5 w-5 text-status-review" />, accent: 'bg-status-review', href: '/admin/complaints?status=in_review' },
    { label: 'Resolved', value: stats.resolved, icon: <CheckCircle className="h-5 w-5 text-status-resolved" />, accent: 'bg-status-resolved', href: '/admin/complaints?status=resolved' },
    { label: 'Total Users', value: stats.totalUsers, icon: <Users className="h-5 w-5 text-primary" />, accent: 'bg-primary/10', href: '/admin/users' },
    { label: 'Departments', value: stats.totalDepartments, icon: <Building2 className="h-5 w-5 text-primary" />, accent: 'bg-primary/10', href: '/admin/departments' },
  ] : [];

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">System-wide overview and management.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
            : statCards.map(s => (
              <Link key={s.label} to={s.href} className="block group">
                <div className="rounded-lg border border-border bg-card p-5 card-shadow hover-shadow transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
                      <p className="mt-1.5 text-3xl font-semibold text-foreground">{s.value}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md ${s.accent}`}>{s.icon}</div>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Manage Complaints', desc: 'View, filter and assign all system complaints', href: '/admin/complaints', icon: <FileText className="h-5 w-5 text-muted-foreground" /> },
            { title: 'Manage Departments', desc: 'Create departments and assign authorities', href: '/admin/departments', icon: <Building2 className="h-5 w-5 text-muted-foreground" /> },
            { title: 'Manage Users', desc: 'View, edit roles, and manage user accounts', href: '/admin/users', icon: <Users className="h-5 w-5 text-muted-foreground" /> },
            { title: 'View Analytics', desc: 'Charts and trends for complaint data', href: '/admin/analytics', icon: <BarChart3 className="h-5 w-5 text-muted-foreground" /> },
          ].map(item => (
            <Link key={item.href} to={item.href} className="block group">
              <div className="rounded-lg border border-border bg-card p-5 card-shadow hover-shadow transition-all flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted shrink-0">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
