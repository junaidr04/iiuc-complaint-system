import React, { useState, useEffect } from 'react';
import { Complaint, UserRole } from '../../types';
import { PriorityBadge, StatusBadge } from '../common/StatusBadge';
import { ComplaintTimeline } from '../common/Timeline';
import { downloadComplaintPDFReceipt } from '../../utils/pdfGenerator';
import { QRModal } from './QRModal';
import {
  X,
  Download,
  QrCode,
  Building2,
  MapPin,
  Calendar,
  User,
  Phone,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Star,
  Send,
  Wrench,
  ShieldAlert,
  Paperclip,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  currentUserRole: UserRole;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateComplaint: (id: string, updateData: any) => Promise<void>;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  currentUserRole,
  currentUserId,
  isOpen,
  onClose,
  onUpdateComplaint,
}) => {
  if (!isOpen || !complaint) return null;

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const [solutionNotes, setSolutionNotes] = useState('');
  const [solutionImgUrl, setSolutionImgUrl] = useState('');
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [staffList, setStaffList] = useState<{ id: string; name: string; department?: string }[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);

  // Admin can hand-pick which staff member handles a complaint. Only staff
  // belonging to the complaint's own department are shown as options.
  const refreshStaffList = () => {
    if (currentUserRole !== 'admin' || !complaint) return;
    fetch('/api/users?role=staff')
      .then((res) => res.json())
      .then((data) => {
        const deptStaff = (data.users || []).filter(
          (u: any) => u.department === complaint.departmentName
        );
        setStaffList(deptStaff);
      })
      .catch(console.error);
  };

  useEffect(() => {
    refreshStaffList();
  }, [currentUserRole, complaint?.id, complaint?.departmentName]);

  const handleAssignStaff = async () => {
    if (!selectedStaffId) return;
    const staff = staffList.find((s) => s.id === selectedStaffId);
    if (!staff) return;
    setIsAssigning(true);
    await onUpdateComplaint(complaint.id, {
      assignedStaffId: staff.id,
      assignedStaffName: staff.name,
      status: complaint.status === 'pending' ? 'assigned' : complaint.status,
      authorRole: currentUserRole,
      authorName: 'Central Admin',
      remarkText: `Assigned to ${staff.name} by Central Admin`,
    });
    setIsAssigning(false);
  };

  const handleCreateAndAssignStaff = async () => {
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;
    setIsCreatingStaff(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStaffName.trim(),
          email: newStaffEmail.trim(),
          role: 'staff',
          department: complaint.departmentName,
        }),
      });
      const data = await res.json();
      const newStaff = data.user;
      if (res.ok && newStaff) {
        // Immediately assign the complaint to the staff member we just created.
        await onUpdateComplaint(complaint.id, {
          assignedStaffId: newStaff.id,
          assignedStaffName: newStaff.name,
          status: complaint.status === 'pending' ? 'assigned' : complaint.status,
          authorRole: currentUserRole,
          authorName: 'Central Admin',
          remarkText: `${newStaff.name} added and assigned by Central Admin`,
        });
        setNewStaffName('');
        setNewStaffEmail('');
        refreshStaffList();
      }
    } catch (err) {
      console.error('Failed to create staff', err);
    }
    setIsCreatingStaff(false);
  };

  const handleAddRemark = async () => {
    if (!newRemark.trim()) return;
    await onUpdateComplaint(complaint.id, {
      remarkText: newRemark,
      authorRole: currentUserRole,
      authorName: currentUserRole === 'admin' ? 'Central Admin' : currentUserRole === 'staff' ? 'Staff Member' : complaint.studentName,
    });
    setNewRemark('');
  };

  const handleUpdateStatus = async (newStatus: string) => {
    await onUpdateComplaint(complaint.id, {
      status: newStatus,
      authorRole: currentUserRole,
      authorName: currentUserRole === 'admin' ? 'Central Admin' : 'Department Staff',
      remarkText: `Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`,
    });
  };

  const handleResolveComplaint = async () => {
    await onUpdateComplaint(complaint.id, {
      status: 'resolved',
      solutionNotes: solutionNotes || 'Issue resolved on site with diagnostic verification.',
      solutionImageUrls: solutionImgUrl ? [solutionImgUrl] : [],
      authorRole: currentUserRole,
      authorName: 'Department Technician',
      remarkText: 'Marked as Resolved with official solution notes.',
    });
    setSolutionNotes('');
    setSolutionImgUrl('');
  };

  const handleSubmitRating = async () => {
    setIsSubmittingRating(true);
    await onUpdateComplaint(complaint.id, {
      rating: {
        score: ratingScore,
        comment: ratingComment,
        date: new Date().toISOString(),
      },
      status: 'closed',
    });
    setIsSubmittingRating(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl my-auto overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-950/50">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-1 rounded-md">
                  {complaint.id}
                </span>
                <PriorityBadge priority={complaint.priority} size="sm" />
                <StatusBadge status={complaint.status} size="sm" />
                {complaint.isEmergency && (
                  <span className="text-xs font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> EMERGENCY
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{complaint.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700 dark:text-slate-300">
            {/* Action Bar (Download Receipt & QR) */}
            <div className="flex flex-wrap gap-2 justify-between items-center bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-300">
                <span>Department: {complaint.departmentName}</span> • <span>Category: {complaint.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsQrOpen(true)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 font-medium text-xs rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <QrCode className="w-4 h-4" /> QR Pass
                </button>
                <button
                  onClick={() => downloadComplaintPDFReceipt(complaint)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PDF Receipt
                </button>
              </div>
            </div>

            {/* Lifecycle Timeline */}
            <ComplaintTimeline
              currentStatus={complaint.status}
              createdDate={complaint.createdDate}
              updatedDate={complaint.updatedDate}
            />

            {/* AI Insights Card if available */}
            {complaint.aiAnalysis && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-xl">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold mb-2 text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Intelligence & Priority Classification
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Predicted Cat.</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{complaint.aiAnalysis.predictedCategory}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">AI Priority</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{complaint.aiAnalysis.predictedPriority}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Sentiment</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{complaint.aiAnalysis.sentiment}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Urgency Score</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{complaint.aiAnalysis.urgencyScore}/100</span>
                  </div>
                </div>
              </div>
            )}

            {/* Description & Location details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description</h4>
                  <p className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed whitespace-pre-line">
                    {complaint.description}
                  </p>
                </div>

                {/* Attached Complaint Photos */}
                {complaint.imageUrls && complaint.imageUrls.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Attached Problem Images</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {complaint.imageUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={url} alt={`Evidence ${i}`} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff Solution Notes & Proof Images */}
                {complaint.solutionNotes && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Resolution Proof & Official Technician Notes
                    </div>
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 whitespace-pre-line">{complaint.solutionNotes}</p>
                    {complaint.solutionImageUrls && complaint.solutionImageUrls.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {complaint.solutionImageUrls.map((url, i) => (
                          <img key={i} src={url} alt="Solution proof" className="w-24 h-24 object-cover rounded-lg border border-emerald-300" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Complainant</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    {complaint.isAnonymous ? 'Anonymous Student' : complaint.studentName}
                  </div>
                </div>

                {!complaint.isAnonymous && (
                  <div>
                    <span className="text-slate-400 block">Student Contact</span>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {complaint.contactNumber || complaint.studentEmail}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 block">Building & Room</span>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {complaint.building} - {complaint.roomNumber}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block">Specific Location</span>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {complaint.location || 'Main campus premises'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block">Assigned Technician</span>
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                    <Wrench className="w-3.5 h-3.5 text-purple-600" />
                    {complaint.assignedStaffName || 'Unassigned'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block">Date Submitted</span>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(complaint.createdDate).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin-only: Assign complaint to a specific staff member */}
            {currentUserRole === 'admin' && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900 space-y-3">
                <h4 className="font-bold text-xs text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                  Assign to Staff ({complaint.departmentName})
                </h4>
                {staffList.length > 0 ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="flex-1 p-2 text-xs rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900"
                    >
                      <option value="">Select a staff member...</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignStaff}
                      disabled={!selectedStaffId || isAssigning}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                    >
                      {isAssigning ? 'Assigning...' : 'Assign Complaint'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-purple-700 dark:text-purple-400">
                      No staff exist for this department yet. Add one now and it will be assigned immediately:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        placeholder="Staff full name"
                        className="flex-1 p-2 text-xs rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="email"
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                        placeholder="staff@campus.com"
                        className="flex-1 p-2 text-xs rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900"
                      />
                      <button
                        onClick={handleCreateAndAssignStaff}
                        disabled={!newStaffName.trim() || !newStaffEmail.trim() || isCreatingStaff}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                      >
                        {isCreatingStaff ? 'Creating...' : 'Create & Assign'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin / Staff Management Control Box */}
            {(currentUserRole === 'admin' || currentUserRole === 'staff') && (
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 space-y-4">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Staff & Admin Control Actions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {complaint.status !== 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus('in_progress')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors"
                    >
                      Set In Progress
                    </button>
                  )}
                  {complaint.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {complaint.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus('rejected')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-lg transition-colors"
                    >
                      Reject Complaint
                    </button>
                  )}
                </div>

                {/* Solution Notes Input Form */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Add Official Solution Proof Notes
                  </label>
                  <textarea
                    rows={2}
                    value={solutionNotes}
                    onChange={(e) => setSolutionNotes(e.target.value)}
                    placeholder="Describe how the problem was inspected and repaired..."
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={solutionImgUrl}
                    onChange={(e) => setSolutionImgUrl(e.target.value)}
                    placeholder="Optional Solution Proof Image URL (https://...)"
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                  />
                  <button
                    onClick={handleResolveComplaint}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Submit Official Resolution
                  </button>
                </div>
              </div>
            )}

            {/* Student Feedback & Service Rating for Resolved Complaints */}
            {complaint.status === 'resolved' && (currentUserRole === 'student' || complaint.rating) && (
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Service Resolution Rating & Feedback
                </div>

                {complaint.rating ? (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= complaint.rating!.score ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                        />
                      ))}
                      <span className="text-xs font-bold ml-2 text-slate-800 dark:text-slate-200">{complaint.rating.score}/5 Stars</span>
                    </div>
                    {complaint.rating.comment && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{complaint.rating.comment}"</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      The department marked this complaint as resolved. How satisfied are you with the resolution speed and service?
                    </p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => setRatingScore(s)}
                          className={`p-2 rounded-lg border transition-all ${ratingScore >= s ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-white border-slate-200 text-slate-400'
                            }`}
                        >
                          <Star className={`w-5 h-5 ${ratingScore >= s ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Optional feedback comments..."
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <button
                      onClick={handleSubmitRating}
                      disabled={isSubmittingRating}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      Submit Service Feedback
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Remarks History & Add Remark */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Official Activity & Remarks History
              </h4>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                {complaint.remarks && complaint.remarks.length > 0 ? (
                  complaint.remarks.map((rmk) => (
                    <div key={rmk.id} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                        <span className="capitalize text-blue-600 dark:text-blue-400">{rmk.authorName} ({rmk.authorRole})</span>
                        <span className="text-[10px] text-slate-400">{new Date(rmk.date).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{rmk.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 p-2">No remarks yet.</p>
                )}
              </div>

              {/* Add Remark Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRemark()}
                  placeholder="Add a comment or follow-up remark..."
                  className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <button
                  onClick={handleAddRemark}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QRModal complaintId={complaint.id} isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </>
  );
};