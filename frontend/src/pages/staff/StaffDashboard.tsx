import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';
import { ComplaintDetailModal } from '../../components/complaints/ComplaintDetailModal';
import { downloadComplaintPDFReceipt } from '../../utils/pdfGenerator';
import {
  Wrench,
  CheckCircle,
  Clock,
  Building2,
  Check,
  Send,
  Eye,
  AlertTriangle,
  UserCheck,
  Download,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const fetchStaffComplaints = () => {
    if (!user) return;
    fetch(`/api/complaints?departmentId=${user.departmentId || 'dept-1'}`)
      .then((res) => res.json())
      .then((data) => setComplaints(data.complaints || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchStaffComplaints();
  }, [user]);

  const handleUpdateComplaint = async (id: string, updateData: any) => {
    await fetch(`/api/complaints/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    fetchStaffComplaints();
    if (selectedComplaint && selectedComplaint.id === id) {
      const res = await fetch(`/api/complaints/${id}`);
      const data = await res.json();
      setSelectedComplaint(data.complaint);
    }
  };

  const myAssigned = complaints.filter((c) => c.assignedStaffId === user?.id || !c.assignedStaffId);
  const pending = myAssigned.filter((c) => c.status === 'pending' || c.status === 'assigned');
  const inProgress = myAssigned.filter((c) => c.status === 'in_progress');
  const resolved = myAssigned.filter((c) => c.status === 'resolved' || c.status === 'closed');

  const filteredList = myAssigned.filter((c) => filterStatus === 'all' || c.status === filterStatus);

  return (
    <div className="space-y-6 py-4">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            Technician & Staff Portal • {user?.department || 'Department Workspace'}
          </span>
          <h1 className="text-2xl font-black tracking-tight">Staff Dispatch Control - {user?.name}</h1>
          <p className="text-xs text-slate-300 mt-1">Manage field assignments, verify reported issues, upload solution proofs & post status updates.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase block">Total Assigned Queue</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{myAssigned.length}</span>
          <span className="text-[10px] text-purple-600 font-medium">Field Queue</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase block">Pending Inspection</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{pending.length}</span>
          <span className="text-[10px] text-amber-600 font-medium">Needs Action</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase block">Active Repair</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">{inProgress.length}</span>
          <span className="text-[10px] text-blue-600 font-medium">In Progress</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase block">Resolved & Closed</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{resolved.length}</span>
          <span className="text-[10px] text-emerald-600 font-medium">Completed Repairs</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {['all', 'pending', 'in_progress', 'resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
              filterStatus === st
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Complaint List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.length > 0 ? (
          filteredList.map((c) => (
            <div
              key={c.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-0.5 rounded">
                    {c.id}
                  </span>
                  <PriorityBadge priority={c.priority} size="sm" />
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{c.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{c.description}</p>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div><strong>Location:</strong> {c.building} - {c.roomNumber} ({c.location || 'N/A'})</div>
                  <div><strong>Student:</strong> {c.isAnonymous ? 'Anonymous' : c.studentName} ({c.contactNumber || c.studentEmail})</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <StatusBadge status={c.status} size="sm" />
                <div className="flex items-center gap-1.5">
                  {c.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateComplaint(c.id, { status: 'in_progress', assignedStaffId: user?.id, assignedStaffName: user?.name })}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      Start Repair
                    </button>
                  )}
                  {c.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateComplaint(c.id, { status: 'resolved', solutionNotes: 'Inspected and repaired on site.' })}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      Mark Solved
                    </button>
                  )}
                  <button
                    onClick={() => downloadComplaintPDFReceipt(c)}
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200"
                    title="Download PDF Pass"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedComplaint(c)}
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No Complaints Found in Queue</p>
          </div>
        )}
      </div>

      <ComplaintDetailModal
        complaint={selectedComplaint}
        currentUserRole="staff"
        currentUserId={user?.id || ''}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdateComplaint={handleUpdateComplaint}
      />
    </div>
  );
};
