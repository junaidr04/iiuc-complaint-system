import React, { useEffect, useState } from 'react';
import { Announcement } from '../../types';
import { Megaphone, Plus, Bell, Calendar, ShieldAlert } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export const ManageAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Maintenance');

  const fetchAnnouncements = () => {
    apiFetch('/api/announcements')
      .then((res) => res.json())
      .then((d) => setAnnouncements(d.announcements || []));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    const res = await apiFetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        category,
        authorName: 'Central Administration',
      }),
    });
    if (res.ok) {
      setTitle('');
      setContent('');
      fetchAnnouncements();
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-amber-500" /> Campus Maintenance Notices & Bulletins
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Broadcast planned outages, power upgrades & facility maintenance warnings to students
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Post Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Broadcast New Bulletin
          </h3>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1">Notice Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Scheduled WiFi Maintenance in Library"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Notice Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="Maintenance">Scheduled Maintenance</option>
                <option value="Emergency Alert">Emergency Hazard Warning</option>
                <option value="General Policy">General Policy Update</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">Notice Description</label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Details regarding affected buildings, timelines..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Post Campus Notice
            </button>
          </form>
        </div>

        {/* Announcements Stream */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Active Public Bulletins
          </h3>

          {announcements.map((ann) => (
            <div key={ann.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{ann.title}</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded">
                  {ann.categoryTag || ann.targetAudience}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{ann.content}</p>
              <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <Calendar className="w-3 h-3" /> Posted {new Date(ann.date).toLocaleString()} by {ann.authorName}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};