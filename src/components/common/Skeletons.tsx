import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardSkeletonProps {
  className?: string;
}

export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({ className }) => (
  <div className={cn('rounded-lg border border-border bg-card p-5', className)}>
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-10 w-10 rounded-md" />
    </div>
  </div>
);

export const ComplaintCardSkeleton: React.FC = () => (
  <div className="rounded-lg border border-border bg-card p-5 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
    <div className="flex items-center gap-4 pt-1">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);
