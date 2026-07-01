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

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  
  // কোন কার্ডটি ওপেন আছে তার আইডি ট্র্যাক করার স্টেট
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user_complaints');
    if (saved) {
      setComplaints(JSON.parse(saved));
    } else {
      // যদি লোকাল স্টোরেজে কিছু না থাকে, তবে ডিফল্ট ডেসক্রিপশনসহ ইনিশিয়াল ডেটা
      const defaultComplaints: Complaint[] = [
        { id: 'CMS-9244', title: 'facce bully issue', category: 'Other', status: 'Resolved', date: '2026-07-01', statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', description: 'Some students are facing cyberbullying issues on social groups. Immediate counseling and community action required.' },
        { id: 'CMS-8831', title: 'WiFi router not working in Hall Room 302', category: 'Infrastructure', status: 'Resolved', date: '2026-06-28', statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', description: 'The main router in the west wing of Hall Room 302 drops connection every 5 minutes. Students cannot access online classes.' },
        { id: 'CMS-7412', title: 'Request to reschedule mid-exam lab assignment conflict', category: 'Academic', status: 'Pending', date: '2026-07-01', statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30', description: 'Our Compiler Design lab assignment deadline conflicts directly with the Microprocessors mid-term exam date.' }
      ];
      localStorage.setItem('user_complaints', JSON.stringify(defaultComplaints));
      setComplaints(defaultComplaints);
    }
  }, []);

  // কার্ডে ক্লিক করলে টগল (খোলা/বন্ধ) করার ফাংশন
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filtered = complaints.filter((c) => 
    c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All System Complaints</h1>
        <p className="text-gray-400 text-sm mt-1">{filtered.length} total complaints in the system</p>
      </div>

      {/* Search Bar */}
      <div className="w-full md:w-96 relative">
        <input
          type="text"
          placeholder="Search complaints..."
          className="w-full bg-gray-900 border border-gray-700 text-gray-200 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          value={search}
          onChange={(e) => setSearchTarget(e.target.value)}
        />
        <span className="absolute left-3 top-3 text-gray-400">🔍</span>
      </div>

      {/* Interactive Complaints List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div 
              key={item.id} 
              className={`bg-gray-800 border ${isExpanded ? 'border-indigo-500 shadow-md shadow-indigo-500/5' : 'border-gray-700 hover:border-gray-600'} p-6 rounded-xl space-y-3 transition-all duration-200 cursor-pointer`}
              onClick={() => toggleExpand(item.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-indigo-400 font-semibold">{item.id}</span>
                    <span className="text-[11px] text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-700">
                      {isExpanded ? 'Click to hide details 🔼' : 'Click to view details 🔽'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-1.5">{item.title}</h3>
                  <p className="text-gray-400 text-xs mt-1">Category: <span className="text-gray-300">{item.category}</span></p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${item.statusColor}`}>
                  {item.status}
                </span>
              </div>

              {/* Collapsible Description Box */}
              {isExpanded && (
                <div className="mt-4 p-4 bg-gray-900/60 rounded-lg border border-gray-700/50 text-sm text-gray-300 animate-fadeIn">
                  <strong className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Complaint Description:</strong>
                  {item.description || "No custom description was provided for this complaint."}
                </div>
              )}

              <div className="text-xs text-gray-500 pt-2 border-t border-gray-700/50 flex justify-between items-center">
                <span>Submitted on {item.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}