import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Filter, ChevronLeft, ChevronRight, UserCheck, CheckCircle, Eye, Loader2, Building2, Calendar, User, Trash2 } from 'lucide-react';
import { getAllComplaints, updateComplaintStatus, deleteComplaint, getDepartments, assignComplaintToAuthority, createNotification, getAllUsers } from '@/services/api';
import type { Complaint, ComplaintFilters, ComplaintStatus, Department, User as UserType } from '@/types/types';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ComplaintCardSkeleton } from '@/components/common/Skeletons';
import { EmptyComplaints } from '@/components/common/EmptyStates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const PAGE_SIZE = 10;

const AdminComplaintsPage: React.FC = () => {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [authorities, setAuthorities] = useState<UserType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ComplaintFilters>({ status: 'all', sort: 'newest' });
  const [searchInput, setSearchInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Complaint | null>(null);
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);
  const [assignAuthorityId, setAssignAuthorityId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data, total: t }, depts, users] = await Promise.all([
      getAllComplaints(filters, page),
      getDepartments(),
      getAllUsers(),
    ]);
    setComplaints(data);
    setTotal(t);
    setDepartments(depts);
    setAuthorities(users.filter(u => u.role === 'authority' || u.role === 'admin'));
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput || undefined }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    await deleteComplaint(deleteTarget.id);
    toast.success('Complaint deleted');
    setDeleteTarget(null);
    setActionLoading(false);
    fetchData();
  };

  const handleAssign = async () => {
    if (!assignTarget || !assignAuthorityId) return;
    setActionLoading(true);
    await assignComplaintToAuthority(assignTarget.id, assignAuthorityId);
    const authority = authorities.find(a => a.id === assignAuthorityId);
    await createNotification({
      receiver_id: assignAuthorityId,
      complaint_id: assignTarget.id,
      message: `A complaint "${assignTarget.title}" has been assigned to you`,
      type: 'assigned',
    });
    toast.success(`Complaint assigned to ${authority?.name ?? 'authority'}`);
    setAssignTarget(null);
    setAssignAuthorityId('');
    setActionLoading(false);
    fetchData();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">All Complaints</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{total} total complaints in the system</p>
          </div>
        </div>

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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.department_id ?? 'all'} onValueChange={v => { setFilters(f => ({ ...f, department_id: v === 'all' ? undefined : v })); setPage(1); }}>
              <SelectTrigger className="w-40">
                <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <ComplaintCardSkeleton key={i} />)
          ) : complaints.length === 0 ? (
            <div className="rounded-lg border border-border bg-card"><EmptyComplaints /></div>
          ) : (
            complaints.map(c => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-5 card-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <Link to={`/admin/complaints/${c.id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors leading-snug min-w-0 flex-1">
                        {c.title}
                      </Link>
                      <StatusBadge status={c.status} className="shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{c.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {c.department && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{c.department.name}</span>}
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                      {!c.is_anonymous && c.creator && <span className="flex items-center gap-1"><User className="h-3 w-3" />{c.creator.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/complaints/${c.id}`}><Eye className="h-3.5 w-3.5 mr-1.5" />View</Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setAssignTarget(c); setAssignAuthorityId(c.assigned_authority_id ?? ''); }}>
                    <UserCheck className="h-3.5 w-3.5 mr-1.5" />Assign
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60" onClick={() => setDeleteTarget(c)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "<strong>{deleteTarget?.title}</strong>"? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign dialog */}
      <Dialog open={!!assignTarget} onOpenChange={() => setAssignTarget(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Assign Complaint</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Assign "<strong>{assignTarget?.title}</strong>" to an authority.</p>
            <div className="space-y-1.5">
              <Label>Authority</Label>
              <Select value={assignAuthorityId} onValueChange={setAssignAuthorityId}>
                <SelectTrigger><SelectValue placeholder="Select authority" /></SelectTrigger>
                <SelectContent>
                  {authorities.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.email})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!assignAuthorityId || actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2" />}Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AdminComplaintsPage;
