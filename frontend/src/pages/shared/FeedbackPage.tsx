import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint, FeedbackItem } from '../../types';
import {
  Star,
  MessageSquareHeart,
  Send,
  CheckCircle2,
  Sparkles,
  Award,
  History,
  Building2,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';

interface FeedbackPageProps {
  onNavigate: (page: string) => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [resolvedComplaints, setResolvedComplaints] = useState<Complaint[]>([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>('');
  const [category, setCategory] = useState<string>('Facilities & Campus Infrastructure');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState<string>('');

  const [pastFeedbacks, setPastFeedbacks] = useState<FeedbackItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const ratingLabels: Record<number, string> = {
    1: 'Poor - Dissatisfied with service speed/quality',
    2: 'Fair - Below expectations, needs improvement',
    3: 'Good - Satisfactory resolution',
    4: 'Very Good - Prompt response and courteous staff',
    5: 'Excellent - Outstanding resolution & exceptional service',
  };

  useEffect(() => {
    if (user) {
      // Fetch user complaints to find resolved ones
      fetch(`/api/complaints?studentId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const list: Complaint[] = data.complaints || [];
          const resolved = list.filter((c) => c.status === 'resolved' || c.status === 'closed');
          setResolvedComplaints(resolved);
          if (resolved.length > 0) {
            setSelectedComplaintId(resolved[0].id);
          }
        })
        .catch(console.error);

      // Fetch past feedbacks
      fetch(`/api/feedbacks?studentId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setPastFeedbacks(data.feedbacks || []))
        .catch(console.error);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      setErrorMsg('Please write a short feedback comment describing your experience.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (selectedComplaintId) {
        // Submit rating directly to specific complaint ticket
        const res = await fetch(`/api/complaints/${selectedComplaintId}/rating`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: rating,
            comment: comments,
            studentId: user?.id,
            studentName: user?.name,
          }),
        });

        if (!res.ok) throw new Error('Failed to submit complaint feedback.');
      }

      // Also post to general feedbacks endpoint for MongoDB persistence
      const fbRes = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.id,
          studentName: user?.name,
          complaintId: selectedComplaintId || undefined,
          complaintTitle: selectedComplaintId
            ? resolvedComplaints.find((c) => c.id === selectedComplaintId)?.title
            : 'General Service Feedback',
          rating,
          category,
          comments,
        }),
      });

      if (fbRes.ok) {
        const data = await fbRes.json();
        setPastFeedbacks((prev) => [data.feedback, ...prev]);
        setSuccessMsg('Thank you! Your feedback has been recorded and submitted to Quality Administration.');
        setComments('');
      } else {
        throw new Error('Failed to record feedback.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
            <MessageSquareHeart className="w-3.5 h-3.5 text-purple-400" /> Quality Audit & Experience Feedback
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Campus Service Feedback</h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed">
            Your honest feedback drives continuous improvement across university facilities, staff accountability, and grievance resolution speeds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feedback Submission Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Submit Service Rating
            </h2>
            <span className="text-xs text-slate-400 font-mono">CCMS Quality Assurance</span>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Feedback Submitted Successfully</p>
                <p className="text-[11px] mt-0.5">{successMsg}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Associated Complaint Selector */}
            {resolvedComplaints.length > 0 ? (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Resolved Complaint Ticket
                </label>
                <select
                  value={selectedComplaintId}
                  onChange={(e) => {
                    setSelectedComplaintId(e.target.value);
                    const comp = resolvedComplaints.find((c) => c.id === e.target.value);
                    if (comp) setCategory(comp.category);
                  }}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {resolvedComplaints.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.title} ({c.departmentName})
                    </option>
                  ))}
                  <option value="">-- General Service Feedback (Not tied to a ticket) --</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Service Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Facilities & Campus Infrastructure">Facilities & Campus Infrastructure</option>
                  <option value="Hostel Maintenance">Hostel Maintenance</option>
                  <option value="IT & Network Services">IT & Network Services</option>
                  <option value="Electrical & Power">Electrical & Power</option>
                  <option value="Medical & Safety">Medical & Safety</option>
                  <option value="Cafeteria & Dining">Cafeteria & Dining</option>
                </select>
              </div>
            )}

            {/* Interactive Star Rating */}
            <div className="space-y-2 bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-900">
              <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                Rating Scale (1 to 5 Stars)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-2 rounded-xl transition-all hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-500 fill-amber-500 drop-shadow-xs'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-black text-amber-600 dark:text-amber-400 ml-2">
                  {rating}/5
                </span>
              </div>
              <p className="text-[11px] font-semibold text-purple-900 dark:text-purple-300">
                {ratingLabels[hoverRating || rating]}
              </p>
            </div>

            {/* Comments Area */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Feedback Message
              </label>
              <textarea
                rows={4}
                required
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share specific details about staff behavior, work quality, response time, or suggestions..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting Feedback...' : 'Submit Official Feedback'} <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Sidebar: Past Submitted Feedbacks */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-500" /> Recent Service Ratings
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {pastFeedbacks.length > 0 ? (
                pastFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= fb.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(fb.date).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {fb.complaintTitle || fb.category}
                    </p>

                    <p className="text-slate-600 dark:text-slate-400 italic leading-relaxed text-[11px]">
                      "{fb.comments}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <ThumbsUp className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">No feedback submitted yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
