import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppNotification } from '../../types';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  Inbox,
  ShieldAlert,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'status_update' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/notifications?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await apiFetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    try {
      await apiFetch(`/api/notifications/clear-all?userId=${user.id}`, {
        method: 'DELETE',
      });
      setNotifications([]);
    } catch (err) {
      // Fallback local clear
      setNotifications([]);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'unread' && n.read) return false;
    if (filterType === 'status_update' && n.type !== 'status_update') return false;
    if (filterType === 'system' && n.type === 'status_update') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.complaintId && n.complaintId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Bell className="w-3.5 h-3.5 animate-pulse text-blue-400" /> Real-time System Dispatch
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Campus Notifications</h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed">
              Stay updated on your complaint resolution progress, staff remarks, emergency announcements, and system alerts.
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="bg-blue-600/30 border border-blue-400/30 backdrop-blur-md px-4 py-3 rounded-2xl text-center flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{unreadCount}</span>
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Unread Messages</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Bar: Filters, Search, Mark Read */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterType === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterType === 'unread'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilterType('status_update')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterType === 'status_update'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            Status Updates
          </button>
          <button
            onClick={() => setFilterType('system')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterType === 'system'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            System Alerts
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter notifications..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 transition-colors shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shrink-0"
              title="Clear all notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications List or Empty State */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Fetching campus notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (notif.complaintId) {
                  onNavigate('my-complaints');
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex items-start gap-4 ${notif.read
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-85 hover:border-blue-300 dark:hover:border-blue-800'
                  : 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 shadow-sm'
                }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'status_update'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                    : notif.type === 'assignment'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                  }`}
              >
                {notif.type === 'status_update' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : notif.type === 'assignment' ? (
                  <Info className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {notif.title}
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.date).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notif.message}
                </p>

                {notif.complaintId && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                      Ticket ID: {notif.complaintId}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5">
                      View Ticket Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No notifications available</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              You're all caught up! When status updates, official remarks, or staff assignments are dispatched regarding your complaints, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};