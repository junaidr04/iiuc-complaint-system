import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, CheckCheck, Circle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/api';
import type { Notification } from '@/types/types';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyNotifications } from '@/components/common/EmptyStates';
import { supabase } from '@/db/supabase';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  status_change: 'Status Update',
  new_comment: 'New Comment',
  assigned: 'Assignment',
  resolved: 'Resolved',
};

const NotificationsPage: React.FC = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!profile?.id) return;
    const data = await getNotifications(profile.id);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    if (!profile?.id) return;
    // Realtime: new notifications
    const channel = supabase
      .channel(`notifs_page:${profile.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `receiver_id=eq.${profile.id}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          toast.info('New notification');
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    if (!profile?.id) return;
    await markAllNotificationsRead(profile.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card card-shadow divide-y divide-border overflow-hidden">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-5 py-4 space-y-2">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded-full mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="py-8">
              <EmptyNotifications />
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={cn('flex items-start gap-3 px-5 py-4 transition-colors', !n.is_read && 'bg-primary/5')}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                role={!n.is_read ? 'button' : undefined}
                style={!n.is_read ? { cursor: 'pointer' } : undefined}
              >
                <div className={cn('mt-0.5 shrink-0', !n.is_read ? 'text-primary' : 'text-muted-foreground')}>
                  {!n.is_read ? <Circle className="h-2.5 w-2.5 fill-current" /> : <Bell className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className={cn('text-sm leading-snug', !n.is_read ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                      {n.message}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    {TYPE_LABELS[n.type] ?? n.type}
                    {!n.is_read && <span className="ml-2 text-primary">• Click to mark read</span>}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
