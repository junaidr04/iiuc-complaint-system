import React, { useEffect, useState } from 'react';
import { AuditLog } from '../../types';
import { History, ShieldCheck, Star } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export const AuditLogs: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    apiFetch('/api/audit-logs')
      .then((res) => res.json())
      .then((d) => setAuditLogs(d.auditLogs || []));
  }, []);

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-600" /> System Audit Trail & Logs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Cryptographically immutable security activity logs & grievance state modifications
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 rounded-l-xl">Timestamp</th>
              <th className="p-3">Complaint ID</th>
              <th className="p-3">Action performed</th>
              <th className="p-3">User / Actor</th>
              <th className="p-3 rounded-r-xl">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="p-3 font-mono text-[11px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-3 font-mono font-bold text-blue-600">{log.complaintId}</td>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{log.action}</td>
                <td className="p-3 font-medium text-slate-600 dark:text-slate-400">{log.performedBy}</td>
                <td className="p-3">
                  <span className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {log.userRole}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};