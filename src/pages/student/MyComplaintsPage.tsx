import React, { useState, useEffect } from 'react';

interface Complaint {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  statusColor: string;
}

export default function MyComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // ডিফল্ট বেস মক ডেটা
  const baseComplaints: Complaint[] = [
    { id: 'CMS-8831', title: 'WiFi router not working in Hall Room 302', category: 'Infrastructure', status: 'In Progress', date: '2026-06-28', statusColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: 'CMS-7412', title: 'Request to reschedule mid-exam lab assignment conflict', category: 'Academic', status: 'Pending', date: '2026-07-01', statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
  ];

  useEffect(() => {
    // লোকাল স্টোরেজে কোনো ডাটা আছে কি না চেক করা
    const saved = localStorage.getItem('user_complaints');
    if (saved) {
      setComplaints(JSON.parse(saved));
    } else {
      // না থাকলে ডিফল্ট ডেটা সেট করা এবং স্টোরেজে পুশ করা
      localStorage.setItem('user_complaints', JSON.stringify(baseComplaints));
      setComplaints(baseComplaints);
    }
  }, []);

  // সার্চ ফিল্টারিং লজিক
  const filteredComplaints = complaints.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Complaints</h1>
        <p className="text-gray-400 text-sm mt-1">Track and manage the status of your submitted complaints.</p>
      </div>

      {/* Filters & Search */}
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
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-xl">
            No complaints found matching your search.
          </div>
        ) : (
          filteredComplaints.map((item) => (
            <div key={item.id} className="bg-gray-800 border border-gray-700 p-6 rounded-xl space-y-3 relative hover:border-gray-600 transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-semibold">{item.id}</span>
                  <h3 className="text-lg font-semibold text-white mt-0.5">{item.title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${item.statusColor}`}>
                  {item.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm">Category: <span className="text-gray-300 font-medium">{item.category}</span></p>
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-700/50">
                Submitted on {item.date}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}