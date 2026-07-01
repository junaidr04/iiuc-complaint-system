import React from 'react';
import { FileText, Bell, Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action, className }) => (
  <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
      {icon ?? <FileText className="h-6 w-6" />}
    </div>
    <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
    {description && <p className="text-sm text-muted-foreground max-w-xs text-pretty">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const EmptyComplaints = ({ action }: { action?: React.ReactNode }) => (
  <EmptyState
    icon={<FileText className="h-6 w-6" />}
    title="No complaints found"
    description="No complaints match your current filters. Try adjusting the search or filters."
    action={action}
  />
);

export const EmptyNotifications = () => (
  <EmptyState
    icon={<Bell className="h-6 w-6" />}
    title="All caught up"
    description="You have no new notifications."
  />
);

export const EmptyUsers = () => (
  <EmptyState
    icon={<Users className="h-6 w-6" />}
    title="No users found"
    description="No users match your search."
  />
);

export const EmptyAnalytics = () => (
  <EmptyState
    icon={<BarChart3 className="h-6 w-6" />}
    title="No data available"
    description="Analytics data will appear here once complaints are submitted."
  />
);
