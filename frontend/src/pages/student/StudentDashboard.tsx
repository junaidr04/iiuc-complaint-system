import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';
import { ComplaintDetailModal } from '../../components/complaints/ComplaintDetailModal';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  Building2,
  Sparkles,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const fetchComplaints = () => {
    if (!user) return;
    fetch(`/api/complaints?studentId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setComplaints(data.complaints || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'pending').length;
  const inProgress = complaints.filter((c) => c.status === 'in_progress' || c.status === 'assigned' || c.status === 'under_review').length;
  const resolved = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
  const rejected = complaints.filter((c) => c.status === 'rejected').length;

  const handleUpdateComplaint = async (id: string, updateData: any) => {
    await fetch(`/api/complaints/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    fetchComplaints();
    if (selectedComplaint && selectedComplaint.id === id) {
      const res = await fetch(`/api/complaints/${id}`);
      const data = await res.json();
      setSelectedComplaint(data.complaint);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Bento Grid Layout System */}
      <div className="grid grid-cols-12 gap-4">
        {/* Hero Welcome Bento Card */}
        <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between">
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-semibold bg-white/20 backdrop-blur-md text-blue-200 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Student Workspace • {user?.department || 'University'}
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-2">Welcome back, {user?.name}!</h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Track your active grievance tickets, view staff remarks, or log a new campus problem with automated AI triage.
            </p>
          </div>
          <div className="relative z-10 pt-4 flex items-center justify-between mt-4 border-t border-white/10">
            <span className="text-xs text-blue-200">Have a facility emergency?</span>
            <button
              onClick={() => onNavigate('submit-complaint')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Log New Complaint
            </button>
          </div>
        </div>

        {/* Quick Action Bento Card */}
        <div className="col-span-12 lg:col-span-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-300">
              Response Guarantee
            </span>
            <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-100 mt-1">24-Hour AI SLA</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              All reported issues are classified & assigned to duty staff within 15 minutes.
            </p>
          </div>
          <div className="pt-4 border-t border-emerald-200 dark:border-emerald-900 flex justify-between items-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <span>Current Status</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Dispatch Active</span>
          </div>
        </div>

        {/* KPI Stat Cards in Bento Row */}
        <div className="col-span-6 lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Logged</span>
          <div className="my-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white block">{total}</span>
            <span className="text-[11px] text-blue-600 font-semibold">All Tickets</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            User Account ID: <span className="font-mono">{user?.id?.slice(0, 8)}</span>
          </div>
        </div>

        <div className="col-span-6 lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Pending Review</span>
          <div className="my-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 block">{pending}</span>
            <span className="text-[11px] text-amber-600 font-semibold">Awaiting Tech</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Queue Status: <span className="text-amber-600 font-bold">Active</span>
          </div>
        </div>

        <div className="col-span-6 lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">In Progress</span>
          <div className="my-2">
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400 block">{inProgress}</span>
            <span className="text-[11px] text-blue-600 font-semibold">Under Repair</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Staff Assigned
          </div>
        </div>

        <div className="col-span-6 lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Resolved</span>
          <div className="my-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block">{resolved}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Fixed & Closed</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Feedback Ready
          </div>
        </div>

        {/* Complaints List Table Bento Container */}
        <div className="col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">My Active Complaint Tickets</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Click any ticket to open details & download PDF pass</p>
            </div>
            <button
              onClick={() => onNavigate('my-complaints')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View All ({complaints.length}) <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {complaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3 font-bold">ID & Title</th>
                    <th className="px-6 py-3 font-bold">Category</th>
                    <th className="px-6 py-3 font-bold">Priority</th>
                    <th className="px-6 py-3 font-bold">Status</th>
                    <th className="px-6 py-3 font-bold">Date Logged</th>
                    <th className="px-6 py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {complaints.slice(0, 5).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block text-[11px]">{c.id}</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{c.title}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{c.category}</td>
                      <td className="px-6 py-4"><PriorityBadge priority={c.priority} size="sm" /></td>
                      <td className="px-6 py-4"><StatusBadge status={c.status} size="sm" /></td>
                      <td className="px-6 py-4 text-slate-500 text-[11px]">{new Date(c.createdDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No complaints logged yet. Have a campus issue?</p>
              <button
                onClick={() => onNavigate('submit-complaint')}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Log New Complaint
              </button>
            </div>
          )}
        </div>
      </div>

      <ComplaintDetailModal
        complaint={selectedComplaint}
        currentUserRole="student"
        currentUserId={user?.id || ''}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdateComplaint={handleUpdateComplaint}
      />
    </div>
  );
};
