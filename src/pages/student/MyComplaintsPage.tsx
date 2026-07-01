import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ThumbsUp, Calendar, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyComplaints, getDepartments } from '@/services/api';
import type { Complaint, Department, ComplaintFilters, ComplaintStatus } from '@/types/types';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ComplaintCardSkeleton } from '@/components/common/Skeletons';
import { EmptyComplaints } from '@/components/common/EmptyStates';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const MyComplaintsPage: React.FC = () => {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ComplaintFilters>({ status: 'all', sort: 'newest' });
  const [searchInput, setSearchInput] = useState('');

  const fetchComplaints = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    const { data, total: t } = await getMyComplaints(profile.id, filters, page);
    setComplaints(data);
    setTotal(t);
    setLoading(false);
  }, [profile?.id, filters, page]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);
  useEffect(() => { getDepartments().then(setDepartments); }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput || undefined }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-5">
        {/* Filters bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search complaints..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Select
              value={filters.status ?? 'all'}
              onValueChange={v => { setFilters(f => ({ ...f, status: v as ComplaintStatus | 'all' })); setPage(1); }}
            >
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
            <Select
              value={filters.sort ?? 'newest'}
              onValueChange={v => { setFilters(f => ({ ...f, sort: v as ComplaintFilters['sort'] })); setPage(1); }}
            >
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

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground">
            {total === 0 ? 'No complaints found' : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} complaints`}
          </p>
        )}

        {/* Complaint list */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <ComplaintCardSkeleton key={i} />)
          ) : complaints.length === 0 ? (
            <div className="rounded-lg border border-border bg-card">
              <EmptyComplaints
                action={
                  <Button asChild size="sm">
                    <Link to="/dashboard/submit">Submit your first complaint</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            complaints.map((c) => (
              <Link key={c.id} to={`/dashboard/complaints/${c.id}`} className="block group">
                <div className={cn(
                  'rounded-lg border border-border bg-card p-5 card-shadow transition-all hover-shadow',
                  'opacity-0 intersect:opacity-100 duration-300'
                )}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug min-w-0 flex-1">
                      {c.title}
                    </h3>
                    <StatusBadge status={c.status} className="shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    {c.department && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {c.department.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {c.upvote_count} upvote{c.upvote_count !== 1 ? 's' : ''}
                    </span>
                    {c.is_anonymous && (
                      <span className="text-muted-foreground/60 italic">Anonymous</span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MyComplaintsPage;
