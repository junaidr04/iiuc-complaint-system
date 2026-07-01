import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { ComplaintStatus } from '@/types/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-status-pending text-status-pending border-transparent',
  },
  in_review: {
    label: 'In Review',
    className: 'bg-status-review text-status-review border-transparent',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-status-resolved text-status-resolved border-transparent',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', config.className, className)}>
      {config.label}
    </Badge>
  );
};
