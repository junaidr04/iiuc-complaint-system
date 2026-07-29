import React, { useEffect, useState } from 'react';
import { Complaint, Department } from '../../types';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';
import { ComplaintDetailModal } from '../../components/complaints/ComplaintDetailModal';
import {
  Users,
  Building2,
  FileText,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  CheckCircle,
  Clock,
  Download,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const fetchAdminData = () => {
    apiFetch('/api/stats')
      .then((res) => res.json())
      .then((d) => setStats(d.stats))
      .catch(console.error);

    apiFetch('/api/complaints')
      .then((res) => res.json())
      .then((d) => setComplaints(d.complaints || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateComplaint = async (id: string, updateData: any) => {
    await apiFetch(`/api/complaints/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    fetchAdminData();
    if (selectedComplaint && selectedComplaint.id === id) {
      const res = await apiFetch(`/api/complaints/${id}`);
      const data = await res.json();
      setSelectedComplaint(data.complaint);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Admin Header Banner */}
      <div className="p-6 bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            Central Administrative Control Desk
          </span>
          <h1 className="text-2xl font-black tracking-tight">University Grievance Governance Overview</h1>
          <p className="text-xs text-slate-300 mt-1">Real-time department dispatching, AI priority classification, SLA compliance & audit metrics.</p>
        </div>
      </div>

      {/* Bento Grid Layout System */}
      <div className="grid grid-cols-12 gap-4">
        {/* AI Priority Engine Hero Card */}
        <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[200px]">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold opacity-80 uppercase tracking-wider">AI Priority Engine</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-3xl font-black tracking-tight">
              {stats?.emergencyCount || 0} Critical <span className="text-lg font-normal opacity-80 italic font-serif">Detected</span>
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium border border-white/10">
                Hostel B Electrical
              </span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium border border-white/10">
                Water Supply Interruption
              </span>
            </div>
          </div>
          <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-blue-100 border-t border-white/10 mt-4">
            <span>Automated AI Triage</span>
            <span className="font-mono font-bold">100% Accuracy</span>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
            <svg width="220" height="220" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
        </div>

        {/* Quick Stat 1: Pending */}
        <div className="col-span-6 lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Pending Triage</span>
          <div className="my-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 block">{stats?.statusBreakdown?.pending || 0}</span>
            <span className="text-[11px] text-amber-600 font-semibold">Awaiting Dispatch</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Total Logged: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{stats?.totalComplaints || 0}</span>
          </div>
        </div>

        {/* Quick Stat 2: Resolved */}
        <div className="col-span-6 lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Resolved Tickets</span>
          <div className="my-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block">{stats?.statusBreakdown?.resolved || 0}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">SLA SLA Compliant</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Success Rate: <span className="font-mono font-bold text-emerald-600">{stats?.resolutionRate || 0}%</span>
          </div>
        </div>

        {/* Sentiment Analysis Card */}
        <div className="col-span-12 lg:col-span-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">Student Sentiment Index</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Campus feedback satisfaction score</p>
            </div>
            <span className="text-2xl">😊</span>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-[11px] uppercase font-bold text-emerald-900 dark:text-emerald-300">
              <span>Positive Response Rate</span>
              <span className="font-mono">84%</span>
            </div>
            <div className="w-full h-2.5 bg-emerald-200 dark:bg-emerald-900/60 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 dark:bg-emerald-400 w-[84%] rounded-full" />
            </div>
          </div>
        </div>

        {/* Middle Row: Category Breakdown */}
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-blue-600" /> Category Ticket Volumes
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
          </div>

          <div className="space-y-3">
            {stats?.categoryBreakdown &&
              Object.entries(stats.categoryBreakdown).map(([cat, cnt]: [string, any]) => {
                const pct = Math.round((cnt / (stats.totalComplaints || 1)) * 100);
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                      <span>{cat}</span>
                      <span className="font-mono text-slate-500">{cnt} tickets ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Middle Row: Priority Breakdown */}
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-rose-600" /> Priority Level Distribution
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Realtime Triage</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">Critical Emergency</span>
              <span className="text-2xl font-black text-rose-900 dark:text-rose-100 mt-1 block">
                {stats?.priorityBreakdown?.critical || 0}
              </span>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">High Priority</span>
              <span className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1 block">
                {stats?.priorityBreakdown?.high || 0}
              </span>
            </div>

            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block">Medium Priority</span>
              <span className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-1 block">
                {stats?.priorityBreakdown?.medium || 0}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300 block">Low Priority</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
                {stats?.priorityBreakdown?.low || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Master Complaints Feed Table Card */}
        <div className="col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Recent Complaints • Real-time Dispatch Console
            </h3>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full">
              {complaints.length} Total Tickets
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3 font-bold">ID & Title</th>
                  <th className="px-6 py-3 font-bold">Department</th>
                  <th className="px-6 py-3 font-bold">Student</th>
                  <th className="px-6 py-3 font-bold">Priority</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                  <th className="px-6 py-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block text-[11px]">{c.id}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{c.title}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{c.departmentName}</td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {c.isAnonymous ? 'Anonymous' : c.studentName}
                    </td>
                    <td className="px-6 py-4"><PriorityBadge priority={c.priority} size="sm" /></td>
                    <td className="px-6 py-4"><StatusBadge status={c.status} size="sm" /></td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs"
                      >
                        Control
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ComplaintDetailModal
        complaint={selectedComplaint}
        currentUserRole="admin"
        currentUserId="admin-1"
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdateComplaint={handleUpdateComplaint}
      />
    </div>
  );
};