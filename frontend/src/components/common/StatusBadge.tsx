import React from 'react';
import { PriorityLevel, ComplaintStatus } from '../../types';
import { AlertTriangle, Clock, CheckCircle2, XCircle, ArrowRightCircle, ShieldAlert, UserCheck } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const configs = {
    low: { bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300', label: 'Low Priority' },
    medium: { bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200', label: 'Medium Priority' },
    high: { bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300', label: 'High Priority' },
    critical: { bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300 font-bold animate-pulse', label: 'CRITICAL EMERGENCY' },
  };

  const config = configs[priority] || configs.medium;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${padding} transition-all`}>
      {priority === 'critical' ? (
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
      ) : priority === 'high' ? (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
      ) : null}
      {config.label}
    </span>
  );
};

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs = {
    pending: { bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300', icon: Clock, label: 'Pending Review' },
    under_review: { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300', icon: ArrowRightCircle, label: 'Under Review' },
    assigned: { bg: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300', icon: UserCheck, label: 'Assigned to Staff' },
    in_progress: { bg: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300', icon: Clock, label: 'In Progress' },
    resolved: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300', icon: CheckCircle2, label: 'Resolved' },
    closed: { bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300', icon: CheckCircle2, label: 'Closed' },
    rejected: { bg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300', icon: XCircle, label: 'Rejected' },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${padding} font-medium`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};
