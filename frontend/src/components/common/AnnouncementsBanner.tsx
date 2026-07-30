import React, { useEffect, useState } from 'react';
import { Announcement } from '../../types';
import { Megaphone, Calendar } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// Shown on Student & Staff dashboards. Admin broadcasts notices from
// ManageAnnouncements (POST /api/announcements) — this component is the
// read-only side that surfaces them to everyone else.
export const AnnouncementsBanner: React.FC = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        apiFetch('/api/announcements')
            .then((res) => res.json())
            .then((d) => setAnnouncements(d.announcements || []))
            .catch(console.error);
    }, []);

    const audience = user?.role === 'staff' ? 'staff' : 'students';
    const visible = announcements.filter(
        (a) => !a.targetAudience || a.targetAudience === 'all' || a.targetAudience === audience
    );

    if (visible.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" /> Campus Notices & Bulletins
            </h3>
            <div className="space-y-2">
                {visible.slice(0, 5).map((ann) => (
                    <div
                        key={ann.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1"
                    >
                        <div className="flex justify-between items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{ann.title}</span>
                            <span className="text-[10px] shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded">
                                {ann.categoryTag || ann.targetAudience}
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{ann.content}</p>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1">
                            <Calendar className="w-3 h-3" /> Posted {new Date(ann.date).toLocaleString()} by {ann.authorName}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};