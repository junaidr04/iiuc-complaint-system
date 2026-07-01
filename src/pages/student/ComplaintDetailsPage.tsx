import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, ThumbsUp, Calendar, Building2, Tag, User,
  CheckCircle, Clock, Eye, MessageSquare, Send, Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getComplaintById, toggleUpvote, addComment } from '@/services/api';
import type { Complaint, ComplaintStatus, User as UserProfile } from '@/types/types';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

const TIMELINE_STATUS_CONFIG: Record<ComplaintStatus, { icon: React.ReactNode; color: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, color: 'text-status-pending bg-status-pending' },
  in_review: { icon: <Eye className="h-4 w-4" />, color: 'text-status-review bg-status-review' },
  resolved: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-status-resolved bg-status-resolved' },
};

const ComplaintDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile, role } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);

  const fetchComplaint = async () => {
    if (!id) return;
    const data = await getComplaintById(id, profile?.id);
    setComplaint(data);
    setLoading(false);
  };

  useEffect(() => { fetchComplaint(); }, [id, profile?.id]);

  const handleUpvote = async () => {
    if (!complaint || !profile?.id) return;
    if (complaint.created_by === profile.id) {
      toast.error("You can't upvote your own complaint");
      return;
    }
    setUpvoting(true);
    await toggleUpvote(complaint.id, profile.id, !!complaint.user_upvoted);
    setComplaint(prev => prev ? {
      ...prev,
      user_upvoted: !prev.user_upvoted,
      upvote_count: prev.upvote_count + (prev.user_upvoted ? -1 : 1),
    } : prev);
    setUpvoting(false);
  };

  const handleAddComment = async () => {
    if (!complaint || !profile?.id || !commentText.trim()) return;
    setSubmittingComment(true);
    const comment = await addComment(complaint.id, profile.id, commentText.trim());
    if (comment) {
      const enrichedComment = {
        ...comment,
        author: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          department_id: profile.department_id,
          profile_image: profile.profile_image,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        } as UserProfile,
      };
      setComplaint(prev => prev ? { ...prev, comments: [...(prev.comments ?? []), enrichedComment] } : prev);
      setCommentText('');
      toast.success('Comment added');
    } else {
      toast.error('Failed to add comment');
    }
    setSubmittingComment(false);
  };

  const canComment = role === 'authority' || role === 'admin';

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-3xl space-y-5">
          <Skeleton className="h-6 w-48" />
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!complaint) {
    return (
      <AppLayout>
        <div className="max-w-3xl">
          <p className="text-muted-foreground">Complaint not found.</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/dashboard/complaints"><ArrowLeft className="h-3.5 w-3.5 mr-1.5" />Back</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const sortedTimeline = [...(complaint.complaint_timeline ?? complaint.timeline ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const backPath = role === 'admin' ? '/admin/complaints'
    : role === 'authority' ? '/authority/complaints'
    : '/dashboard/complaints';

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-5">
        {/* Back */}
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to={backPath}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />Back to complaints
          </Link>
        </Button>

        {/* Main card */}
        <div className="rounded-lg border border-border bg-card p-6 card-shadow space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground leading-snug">{complaint.title}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{complaint.category}</span>
                {complaint.department && (
                  <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{complaint.department.name}</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(complaint.created_at), 'MMM d, yyyy')}
                </span>
                {!complaint.is_anonymous && complaint.creator && (
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{complaint.creator.name}</span>
                )}
                {complaint.is_anonymous && <span className="italic text-muted-foreground/60">Anonymous</span>}
              </div>
            </div>
            <StatusBadge status={complaint.status} className="shrink-0" />
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {/* Image */}
          {complaint.image_url && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Attachment</h3>
              <img
                src={complaint.image_url}
                alt="Complaint attachment"
                onClick={() => setImageExpanded(!imageExpanded)}
                className={cn(
                  'rounded-lg border border-border cursor-pointer transition-all object-cover',
                  imageExpanded ? 'max-w-full' : 'max-h-48'
                )}
              />
              <p className="text-xs text-muted-foreground mt-1">Click image to {imageExpanded ? 'collapse' : 'expand'}</p>
            </div>
          )}

          {/* Upvote */}
          <div className="flex items-center gap-3 pt-1 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpvote}
              disabled={upvoting}
              className={cn('gap-2', complaint.user_upvoted ? 'border-primary text-primary bg-primary/5' : '')}
            >
              {upvoting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5" />}
              {complaint.upvote_count} Upvote{complaint.upvote_count !== 1 ? 's' : ''}
            </Button>
            <span className="text-xs text-muted-foreground">
              {complaint.user_upvoted ? 'You upvoted this' : 'Upvote to show support'}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-lg border border-border bg-card p-6 card-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-5">Status Timeline</h3>
          <div className="relative">
            <div className="absolute left-4 top-5 bottom-5 w-px bg-border" />
            <div className="space-y-5">
              {sortedTimeline.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-10">No timeline entries yet.</p>
              ) : sortedTimeline.map((entry) => {
                const status = entry.status as ComplaintStatus;
                const config = TIMELINE_STATUS_CONFIG[status] ?? TIMELINE_STATUS_CONFIG['pending'];
                return (
                  <div key={entry.id} className="flex items-start gap-4 relative">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full shrink-0 z-10',
                      config.color
                    )}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          {status === 'pending' ? 'Complaint Submitted'
                            : status === 'in_review' ? 'Under Review'
                            : 'Resolved'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="rounded-lg border border-border bg-card p-6 card-shadow space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Comments ({complaint.comments?.length ?? 0})
          </h3>

          {(complaint.comments?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {complaint.comments?.map(c => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                    <AvatarImage src={c.author?.profile_image ?? undefined} />
                    <AvatarFallback className="text-xs bg-muted">
                      {c.author?.name?.slice(0, 2).toUpperCase() ?? '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">{c.author?.name ?? 'Authority'}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {canComment && (
            <div className="space-y-2 pt-2 border-t border-border">
              <Textarea
                placeholder="Add a comment..."
                rows={3}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="resize-none"
              />
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!commentText.trim() || submittingComment}
                className="gap-2"
              >
                {submittingComment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Post Comment
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ComplaintDetailsPage;
