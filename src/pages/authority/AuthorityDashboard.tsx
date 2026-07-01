import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown, CheckCircle, Eye, Clock, Loader2, Building2, Calendar, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAssignedComplaints, updateComplaintStatus, createNotification } from '@/services/api';
import type { Complaint, ComplaintFilters, ComplaintStatus } from '@/types/types';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ComplaintCardSkeleton } from '@/components/common/Skeletons';
import { EmptyComplaints } from '@/components/common/EmptyStates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

const PAGE_SIZE = 10;

const STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus | null> = {
  pending: 'in_review',
  in_review: 'resolved',
  resolved: null,
};

const AuthorityDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ComplaintFilters>({ status: 'all', sort: 'newest' });
  const [searchInput, setSearchInput] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ complaintId: string; newStatus: ComplaintStatus; title: string } | null>(null);

  const fetchComplaints = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    const { data, total: t } = await getAssignedComplaints(profile.id, filters, page);
    setComplaints(data);
    setTotal(t);
    setLoading(false);
  }, [profile?.id, filters, page]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput || undefined }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleStatusUpdate = async () => {
    if (!confirmDialog || !profile?.id) return;
    const { complaintId, newStatus } = confirmDialog;
    setUpdating(complaintId);
    setConfirmDialog(null);

    const statusLabel = newStatus === 'in_review' ? 'In Review' : 'Resolved';
    await updateComplaintStatus(complaintId, newStatus, profile.id, `Status updated to ${statusLabel}`);

    // Notify complaint creator
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint && complaint.created_by) {
      await createNotification({
        receiver_id: complaint.created_by,
        complaint_id: complaintId,
        message: `Your complaint "${complaint.title}" has been updated to "${statusLabel}"`,
        type: newStatus === 'resolved' ? 'resolved' : 'status_change',
      });
    }

    toast.success(`Complaint marked as ${statusLabel}`);
    fetchComplaints();
    setUpdating(null);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inReviewCount = complaints.filter(c => c.status === 'in_review').length;

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Authority Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and update complaints assigned to you.</p>
        </div>

        {/* Quick stats */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Assigned', value: total, icon: <ArrowUpDown className="h-4 w-4 text-primary" />, bg: 'bg-primary/10' },
              { label: 'Pending', value: pendingCount, icon: <Clock className="h-4 w-4 text-status-pending" />, bg: 'bg-status-pending' },
              { label: 'In Review', value: inReviewCount, icon: <Eye className="h-4 w-4 text-status-review" />, bg: 'bg-status-review' },
            ].map(s => (
              <div key={s.label} className="rounded-lg border border-border bg-card p-4 card-shadow flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-md shrink-0 ${s.bg}`}>{s.icon}</div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-semibold">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search complaints..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2 shrink-0">
            <Select value={filters.status ?? 'all'} onValueChange={v => { setFilters(f => ({ ...f, status: v as ComplaintStatus | 'all' })); setPage(1); }}>
              <SelectTrigger className="w-36">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sort ?? 'newest'} onValueChange={v => { setFilters(f => ({ ...f, sort: v as ComplaintFilters['sort'] })); setPage(1); }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="upvotes">Most Upvoted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Complaint list */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <ComplaintCardSkeleton key={i} />)
          ) : complaints.length === 0 ? (
            <div className="rounded-lg border border-border bg-card">
              <EmptyComplaints />
            </div>
          ) : (
            complaints.map(c => {
              const nextStatus = STATUS_TRANSITIONS[c.status];
              const isUpdating = updating === c.id;
              return (
                <div key={c.id} className="rounded-lg border border-border bg-card p-5 card-shadow">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <Link to={`/authority/complaints/${c.id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors leading-snug min-w-0 flex-1">
                          {c.title}
                        </Link>
                        <StatusBadge status={c.status} className="shrink-0" />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{c.description}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {c.department && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{c.department.name}</span>}
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                        {!c.is_anonymous && c.creator && <span className="flex items-center gap-1"><User className="h-3 w-3" />{c.creator.name}</span>}
                        {c.is_anonymous && <span className="italic">Anonymous</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/authority/complaints/${c.id}`}>View Details</Link>
                    </Button>
                    {nextStatus && (
                      <Button
                        size="sm"
                        onClick={() => setConfirmDialog({ complaintId: c.id, newStatus: nextStatus, title: c.title })}
                        disabled={isUpdating}
                        className="gap-1.5"
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : nextStatus === 'in_review' ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        Mark as {nextStatus === 'in_review' ? 'In Review' : 'Resolved'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Update Complaint Status</AlertDialogTitle>
            <AlertDialogDescription>
              Mark "<strong>{confirmDialog?.title}</strong>" as{' '}
              <strong>{confirmDialog?.newStatus === 'in_review' ? 'In Review' : 'Resolved'}</strong>?
              This action will notify the complaint creator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusUpdate}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default AuthorityDashboard;
