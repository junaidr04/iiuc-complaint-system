import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('user_complaints');
    if (saved) {
      const list = JSON.parse(saved);
      setCounts({
        total: list.length,
        pending: list.filter((c: any) => c.status === 'Pending').length,
        inProgress: list.filter((c: any) => c.status === 'In Progress').length,
        resolved: list.filter((c: any) => c.status === 'Resolved').length,
      });
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">System-wide overview and management.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Complaints', count: counts.total, color: 'text-indigo-400' },
          { title: 'Pending Issues', count: counts.pending, color: 'text-amber-400' },
          { title: 'In Progress', count: counts.inProgress, color: 'text-blue-400' },
          { title: 'Resolved', count: counts.resolved, color: 'text-emerald-400' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-gray-800 border border-gray-700 p-6 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
              <h3 className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.count}</h3>
            </div>
            <div className="text-xl bg-gray-700/50 p-2 rounded-lg">📊</div>
          </div>
        ))}
      </div>

      {/* Admin Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div onClick={() => navigate('/admin/complaints')} className="bg-gray-800 border border-gray-700 hover:border-gray-600 p-5 rounded-xl flex items-center gap-4 cursor-pointer transition">
          <div className="text-2xl bg-indigo-500/10 text-indigo-400 p-3 rounded-lg">🗂️</div>
          <div>
            <h4 className="text-white font-semibold text-base">Manage Complaints</h4>
            <p className="text-gray-400 text-xs mt-0.5">View, filter and assign all system complaints</p>
          </div>
        </div>
        <div onClick={() => navigate('/admin/users')} className="bg-gray-800 border border-gray-700 hover:border-gray-600 p-5 rounded-xl flex items-center gap-4 cursor-pointer transition">
          <div className="text-2xl bg-purple-500/10 text-purple-400 p-3 rounded-lg">👥</div>
          <div>
            <h4 className="text-white font-semibold text-base">Manage Users</h4>
            <p className="text-gray-400 text-xs mt-0.5">View, edit roles, and manage user accounts</p>
          </div>
        </div>
      </div>
    </div>
  );
}