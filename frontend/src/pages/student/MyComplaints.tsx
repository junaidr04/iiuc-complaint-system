import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint, ComplaintStatus, PriorityLevel } from '../../types';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';
import { ComplaintDetailModal } from '../../components/complaints/ComplaintDetailModal';
import { downloadComplaintPDFReceipt } from '../../utils/pdfGenerator';
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  Trash2,
  Download,
  Eye,
  QrCode,
  Building2,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface MyComplaintsProps {
  onNavigate: (page: string) => void;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const fetchComplaints = () => {
    if (!user) return;
    apiFetch(`/api/complaints?studentId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setComplaints(data.complaints || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  // If we arrived here via a scanned QR code (/track/:id), auto-open that complaint
  useEffect(() => {
    const pendingId = localStorage.getItem('ccms_pending_track_id');
    if (pendingId && complaints.length > 0) {
      const match = complaints.find((c) => c.id === pendingId);
      if (match) {
        setSelectedComplaint(match);
      }
      localStorage.removeItem('ccms_pending_track_id');
    }
  }, [complaints]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pending complaint?')) return;
    const res = await apiFetch(`/api/complaints/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchComplaints();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete.');
    }
  };

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
      c.category.toLowerCase().includes(q) ||
      c.building.toLowerCase().includes(q);
    return matchStatus && matchPriority && matchSearch;
  });

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> My Complaint History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track real-time status updates, download PDF passes & rate service quality
          </p>
        </div>
        <button
          onClick={() => onNavigate('submit-complaint')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Submit Complaint
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, title, building..."
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
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
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

      {/* Complaints List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((c) => (
            <div
              key={c.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs hover:border-blue-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded">
                    {c.id}
                  </span>
                  <PriorityBadge priority={c.priority} size="sm" />
                  <StatusBadge status={c.status} size="sm" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{c.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                  <span>Building: {c.building} ({c.roomNumber})</span> •
                  <span>Department: {c.departmentName}</span> •
                  <span>Logged: {new Date(c.createdDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => setSelectedComplaint(c)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
                <button
                  onClick={() => downloadComplaintPDFReceipt(c)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl"
                  title="Download PDF Pass"
                >
                  <Download className="w-4 h-4" />
                </button>
                {c.status === 'pending' && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl transition-colors"
                    title="Delete Pending Complaint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No Complaints Match Filter</p>
            <p className="text-xs text-slate-400">Try adjusting your status or priority filter options above.</p>
          </div>
        )}
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