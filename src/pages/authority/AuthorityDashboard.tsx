import React, { useState, useEffect } from 'react';

interface Complaint {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  statusColor: string;
  description?: string;
}

export default function AuthorityDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    // স্টুডেন্টের সাবমিট করা গ্লোবাল কমপ্লেইন লিস্ট রিড করা
    const saved = localStorage.getItem('user_complaints');
    if (saved) {
      setComplaints(JSON.parse(saved));
    } else {
      // লোকাল স্টোরেজে কিছু না থাকলে ডিফল্ট বেস ডেটা সেট করা
      const defaultComplaints = [
        { id: 'CMS-8831', title: 'WiFi router not working in Hall Room 302', category: 'Infrastructure', status: 'In Progress', date: '2026-06-28', statusColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        { id: 'CMS-7412', title: 'Request to reschedule mid-exam lab assignment conflict', category: 'Academic', status: 'Pending', date: '2026-07-01', statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
      ];
      localStorage.setItem('user_complaints', JSON.stringify(defaultComplaints));
      setComplaints(defaultComplaints);
    }
  }, []);

  // স্ট্যাটাস চেঞ্জ করার ফাংশন (অথরিটি অ্যাকশন)
  const handleStatusChange = (id: string, newStatus: string) => {
    let color = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (newStatus === 'In Progress') color = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (newStatus === 'Resolved') color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

    const updated = complaints.map(c => {
      if (c.id === id) {
        return { ...c, status: newStatus, statusColor: color };
      }
      return c;
    });

    setComplaints(updated);
    localStorage.setItem('user_complaints', JSON.stringify(updated));
  };

  // সার্চ এবং স্ট্যাটাস ফিল্টারিং লজিক
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Authority Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Manage and update complaints assigned to you.</p>
      </div>

      {/* Filters Area - Fixed Dark Design */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-800/40 p-4 rounded-xl border border-gray-700">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search complaints..."
            className="w-full bg-gray-900 border border-gray-700 text-gray-200 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-3 text-gray-400">🔍</span>
        </div>

        <div className="flex gap-3 w-full md:w-auto justify-end">
          <select
            className="bg-gray-900 border border-gray-700 text-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints List - Fixed Dark Cards */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-xl">
            No complaints available to review.
          </div>
        ) : (
          filteredComplaints.map((item) => (
            <div key={item.id} className="bg-gray-800 border border-gray-700 p-6 rounded-xl space-y-4 hover:border-gray-600 transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-semibold">{item.id}</span>
                  <h3 className="text-lg font-semibold text-white mt-0.5">{item.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">Category: <span className="text-gray-300 font-medium">{item.category}</span></p>
                </div>
                
                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${item.statusColor}`}>
                  {item.status}
                </span>
              </div>

              {/* Action Tools for Authority */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-700/60 gap-3">
                <span className="text-xs text-gray-500">Submitted on {item.date}</span>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs text-gray-400 hidden sm:inline">Update Status:</span>
                  <select
                    className="bg-gray-900 border border-gray-700 text-xs text-gray-300 px-2.5 py-1.5 rounded focus:outline-none focus:border-indigo-500 cursor-pointer"
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}