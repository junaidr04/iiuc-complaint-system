import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, Clock, Eye, CheckCircle, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentStats, getNotifications } from '@/services/api';
import type { ComplaintStats, Notification } from '@/types/types';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { StatCardSkeleton } from '@/components/common/Skeletons';
import { EmptyNotifications } from '@/components/common/EmptyStates';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, accent }) => (
  <div className="rounded-lg border border-border bg-card p-5 card-shadow opacity-0 intersect:opacity-100 transition-all duration-500 intersect:translate-y-0 translate-y-2">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="mt-1.5 text-3xl font-semibold text-foreground">{value}</p>
      </div>
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-md', accent ?? 'bg-muted')}>
        {icon}
      </div>
    </div>
  </div>
);

const StudentDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    Promise.all([
      getStudentStats(profile.id),
      getNotifications(profile.id),
    ]).then(([s, n]) => {
      setStats(s);
      setNotifications(n.slice(0, 5));
      setLoading(false);
    });
  }, [profile?.id]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {greeting}, {profile?.name?.split(' ')[0] ?? 'there'} 👋
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Here's an overview of your complaints and recent activity.
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/submit">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Complaint
            </Link>
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="Total" value={stats?.total ?? 0} icon={<FileText className="h-5 w-5 text-primary" />} accent="bg-primary/10" />
              <StatCard label="Pending" value={stats?.pending ?? 0} icon={<Clock className="h-5 w-5 text-status-pending" />} accent="bg-status-pending" />
              <StatCard label="In Review" value={stats?.inReview ?? 0} icon={<Eye className="h-5 w-5 text-status-review" />} accent="bg-status-review" />
              <StatCard label="Resolved" value={stats?.resolved ?? 0} icon={<CheckCircle className="h-5 w-5 text-status-resolved" />} accent="bg-status-resolved" />
            </>
          )}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent notifications */}
          <div className="rounded-lg border border-border bg-card card-shadow">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                Recent Notifications
              </h3>
              <Link to="/notifications" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 space-y-1.5">
                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
                  </div>
                ))
              ) : notifications.length === 0 ? (
                <div className="px-5 py-8">
                  <EmptyNotifications />
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={cn('px-5 py-3', !n.is_read && 'bg-primary/5')}>
                    <p className="text-sm text-foreground leading-snug">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-lg border border-border bg-card card-shadow p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start gap-3">
                <Link to="/dashboard/submit">
                  <PlusCircle className="h-4 w-4 text-primary" />
                  Submit a new complaint
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-3">
                <Link to="/dashboard/complaints">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  View all my complaints
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-3">
                <Link to="/notifications">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  View all notifications
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;
