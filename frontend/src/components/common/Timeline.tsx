import React from 'react';
import { ComplaintStatus } from '../../types';
import { CheckCircle2, Clock, UserCheck, AlertCircle, XCircle } from 'lucide-react';

interface TimelineProps {
  currentStatus: ComplaintStatus;
  createdDate: string;
  updatedDate: string;
}

export const ComplaintTimeline: React.FC<TimelineProps> = ({ currentStatus, createdDate, updatedDate }) => {
  const steps: { key: ComplaintStatus; title: string; desc: string }[] = [
    { key: 'pending', title: 'Pending', desc: 'Complaint logged in system' },
    { key: 'under_review', title: 'Under Review', desc: 'Category & priority verification' },
    { key: 'assigned', title: 'Assigned', desc: 'Dispatched to department staff' },
    { key: 'in_progress', title: 'In Progress', desc: 'Technician resolving on site' },
    { key: 'resolved', title: 'Resolved', desc: 'Solution verified & proof uploaded' },
    { key: 'closed', title: 'Closed', desc: 'Student feedback completed' },
  ];

  const statusOrder: ComplaintStatus[] = ['pending', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed'];

  if (currentStatus === 'rejected') {
    return (
      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-3">
        <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-rose-900 dark:text-rose-200">Complaint Rejected</h4>
          <p className="text-sm text-rose-700 dark:text-rose-300">
            This complaint was reviewed and rejected by administration. Please check official remarks for justification.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="w-full py-4">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
        Complaint Lifecycle Workflow
      </h4>
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || currentStatus === 'closed' || currentStatus === 'resolved';
          const isCurrent = idx === currentIndex && currentStatus !== 'closed' && currentStatus !== 'resolved';

          return (
            <div key={step.key} className="flex-1 flex md:flex-col items-center gap-3 md:text-center w-full relative">
              {/* Connector line for desktop */}
              {idx < steps.length - 1 && (
                <div
                  className={`hidden md:block absolute top-4 left-1/2 w-full h-1 -z-10 transition-colors ${
                    idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}

              {/* Icon circle */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>

              {/* Step info */}
              <div className="flex-1 md:w-full">
                <p
                  className={`text-xs font-bold ${
                    isCompleted
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : isCurrent
                      ? 'text-blue-700 dark:text-blue-400 font-extrabold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight hidden md:block">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
