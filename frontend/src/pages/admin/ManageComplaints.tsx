import React, { useEffect, useState } from 'react';
import { Complaint } from '../../types';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';
import { ComplaintDetailModal } from '../../components/complaints/ComplaintDetailModal';
import { downloadComplaintPDFReceipt } from '../../utils/pdfGenerator';
import { FileText, Search, Filter, Wrench, ShieldAlert, Download } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export const ManageComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const fetchComplaints = () => {
    apiFetch('/api/complaints')
      .then((res) => res.json())
      .then((d) => setComplaints(d.complaints || []));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateComplaint = async (id: string, updateData: any) => {
    await apiFetch(`/api/complaints/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    fetchComplaints();
    if (selectedComplaint && selectedComplaint.id === id) {
      const res = await apiFetch(`/api/complaints/${id}`);
      const data = await res.json();
      setSelectedComplaint(data.complaint);
    }
  };

  const filtered = complaints.filter((c) => {
    const matchStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchPriority = selectedPriority === 'all' || c.priority === selectedPriority;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.departmentName.toLowerCase().includes(q) ||
      c.building.toLowerCase().includes(q);
    return matchStatus && matchPriority && matchSearch;
  });

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-rose-600" /> Master Complaint Management Desk
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Full administrative authority over status escalations, technician re-assignments & priority overrides
        </p>
      </div>

      {/* Filter controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, title, building..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Emergency</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 rounded-l-xl">ID & Title</th>
              <th className="p-3">Department</th>
              <th className="p-3">Student</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3 rounded-r-xl text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="p-3">
                  <span className="font-mono font-bold text-rose-600 block text-[11px]">{c.id}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{c.title}</span>
                </td>
                <td className="p-3 font-medium text-slate-600 dark:text-slate-400">{c.departmentName}</td>
                <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                  {c.isAnonymous ? 'Anonymous' : c.studentName}
                </td>
                <td className="p-3"><PriorityBadge priority={c.priority} size="sm" /></td>
                <td className="p-3"><StatusBadge status={c.status} size="sm" /></td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => downloadComplaintPDFReceipt(c)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
                      title="Download PDF Receipt"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedComplaint(c)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      Control
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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