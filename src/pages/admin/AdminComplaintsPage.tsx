import React, { useState, useEffect } from 'react';

interface StudentInfo {
  name: string;
  id: string;
  semester: string;
  dept: string;
}

interface Complaint {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  statusColor: string;
  description?: string;
  studentInfo?: StudentInfo;
  authorityPermission: boolean;
}

export default function AdminComplaintsPage() {
  const [activeTab, setActiveTab] = useState<'complaints' | 'analytics' | 'settings'>('complaints');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // পাসওয়ার্ড সেটিংস স্টেট
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  // সেটিংস কনফিগারেশন স্টেট
  const [emailNotify, setEmailNotify] = useState(true);
  const [autoAssign, setAutoAssign] = useState(false);

  // লোকাল স্টোরেজ থেকে রোল রিড করা (Admin / Authority / Student)
  const userRole = localStorage.getItem('user_role') || 'Authority'; 

  useEffect(() => {
    const saved = localStorage.getItem('user_complaints');
    if (saved) {
      setComplaints(JSON.parse(saved));
    } else {
      const defaultComplaints: Complaint[] = [
        { 
          id: 'CMS-7241', 
          title: 'complaint against saifur rahman', 
          category: 'Academic', 
          status: 'Pending', 
          date: '2026-07-01', 
          statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30', 
          description: 'Faculty issues and marking discrimination detailed description goes here.',
          studentInfo: { name: 'Junaid Bin Jahangir', id: 'C211045', semester: '5th', dept: 'CSE' },
          authorityPermission: false
        },
        { 
          id: 'CMS-4352', 
          title: 'complaint against Micro sir', 
          category: 'Academic', 
          status: 'Pending', 
          date: '2026-07-01', 
          statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30', 
          description: 'Microprocessor course attendance or lab tracking issues.',
          studentInfo: { name: 'Asif Iqbal', id: 'C221092', semester: '4th', dept: 'CSE' },
          authorityPermission: false
        },
        { 
          id: 'CMS-9244', 
          title: 'facce bully issue', 
          category: 'Other', 
          status: 'Resolved', 
          date: '2026-07-01', 
          statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 
          description: 'Cyberbullying issues resolved through student council counseling.',
          studentInfo: { name: 'Rahat Khan', id: 'C211045', semester: '5th', dept: 'CSE' },
          authorityPermission: false
        }
      ];
      localStorage.setItem('user_complaints', JSON.stringify(defaultComplaints));
      setComplaints(defaultComplaints);
    }
  }, []);

  // অ্যানালিটিক্স লজিক
  const totalComplaints = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const academicCount = complaints.filter(c => c.category === 'Academic').length;
  const infraCount = complaints.filter(c => c.category === 'Infrastructure').length;
  const otherCount = complaints.filter(c => c.category === 'Other').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;

  // Authority পারমিশন হ্যান্ডলার
  const grantPermission = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    const updated = complaints.map(c => c.id === id ? { ...c, authorityPermission: true } : c);
    setComplaints(updated);
    localStorage.setItem('user_complaints', JSON.stringify(updated));
  };

  // Admin স্ট্যাটাস চেঞ্জার হ্যান্ডলার
  const changeStatus = (id: string, newStatus: string, color: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = complaints.map(c => c.id === id ? { ...c, status: newStatus, statusColor: color } : c);
    setComplaints(updated);
    localStorage.setItem('user_complaints', JSON.stringify(updated));
  };

  // পাসওয়ার্ড আপডেট লজিক
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setSettingsMessage('❌ Please fill in both fields.');
      return;
    }
    // রিয়েলটাইম স্যান্ডবক্স আপডেট
    localStorage.setItem(`pwd_${userRole.toLowerCase()}`, newPassword);
    setSettingsMessage('✅ Password updated successfully for ' + userRole + '!');
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const filtered = complaints.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 font-sans">
      
      {/* বাম পাশের সাইডবার */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-6 hidden md:flex shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">U</div>
            <span className="text-xl font-bold text-white tracking-tight">UniCMS</span>
          </div>
          
          <nav className="space-y-1.5">
            <button onClick={() => setActiveTab('complaints')} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl w-full text-left transition border ${activeTab === 'complaints' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-semibold' : 'text-gray-400 border-transparent hover:bg-gray-800/50 hover:text-gray-200'}`}>
              📋 Complaints List
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl w-full text-left transition border ${activeTab === 'analytics' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-semibold' : 'text-gray-400 border-transparent hover:bg-gray-800/50 hover:text-gray-200'}`}>
              📊 Analytics Overview
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl w-full text-left transition border ${activeTab === 'settings' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-semibold' : 'text-gray-400 border-transparent hover:bg-gray-800/50 hover:text-gray-200'}`}>
              ⚙️ System Settings
            </button>
          </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-xl transition">
          🚪 Sign Out
        </button>
      </aside>

      {/* মেইন কনটেন্ট এরিয়া */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
          
          {/* হেডার */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white tracking-tight capitalize">
                {activeTab === 'complaints' && 'System Complaints Tracker'}
                {activeTab === 'analytics' && 'Performance & Analytics Panel'}
                {activeTab === 'settings' && 'Control & Password Settings'}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Active Role:</span>
                <span className="text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-md border border-indigo-500/20 shadow-sm">
                  {userRole} Mode
                </span>
              </div>
            </div>

            {activeTab === 'complaints' && (
              <div className="w-full sm:w-80">
                <input type="text" placeholder="Search by ID or keywords..." className="w-full bg-gray-900 border border-gray-700 text-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition placeholder-gray-500 shadow-inner" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            )}
          </div>

          {/* TAB ১: COMPLAINTS LIST (ফিক্সড রোল লজিক সহ) */}
          {activeTab === 'complaints' && (
            <div className="space-y-4">
              {filtered.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <div key={item.id} className={`bg-gray-900/40 border rounded-2xl p-5 space-y-4 cursor-pointer transition-all duration-200 ${isExpanded ? 'border-indigo-500 bg-gray-900 shadow-xl shadow-indigo-500/5' : 'border-gray-800 hover:border-gray-700 hover:bg-gray-900/60'}`} onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{item.id}</span>
                          {item.authorityPermission ? (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-md border border-emerald-500/20 font-medium">⚖️ Authority Allowed Trial</span>
                          ) : (
                            <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2.5 py-0.5 rounded-md border border-amber-500/20 font-medium">⏳ Awaiting Authority Permission</span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-white capitalize">{item.title}</h3>
                        <p className="text-gray-400 text-xs">Category: <span className="text-gray-300 font-medium">{item.category}</span></p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${item.statusColor}`}>{item.status}</span>
                    </div>

                    {isExpanded && (
                      <div className="space-y-4 pt-4 border-t border-gray-800/60" onClick={e => e.stopPropagation()}>
                        {item.studentInfo && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs">
                            <div><span className="text-gray-500 block mb-0.5">Complainant:</span><strong className="text-gray-200 text-sm">{item.studentInfo.name}</strong></div>
                            <div><span className="text-gray-500 block mb-0.5">ID:</span><strong className="text-gray-300 font-mono text-sm">{item.studentInfo.id}</strong></div>
                            <div><span className="text-gray-500 block mb-0.5">Semester:</span><strong className="text-gray-300 text-sm">{item.studentInfo.semester}</strong></div>
                            <div><span className="text-gray-500 block mb-0.5">Dept:</span><strong className="text-indigo-400 text-sm">{item.studentInfo.dept}</strong></div>
                          </div>
                        )}

                        <div className="p-4 bg-gray-950/40 rounded-xl border border-gray-800 text-sm text-gray-300">
                          {item.description || 'No description provided.'}
                        </div>

                        {/* অ্যাকশন বাটন এরিয়া (সবগুলো অপশন এখানে ক্লিয়ারলি হ্যান্ডেলড) */}
                        <div className="pt-3 flex flex-wrap gap-2 justify-end border-t border-gray-800/60">
                          {/* ১. Authority প্যানেল একশন */}
                          {userRole === 'Authority' && !item.authorityPermission && (
                            <button onClick={(e) => grantPermission(item.id, e)} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md">
                              Grant Permission to Admin
                            </button>
                          )}

                          {/* ২. Admin প্যানেল একশন (যখন Authority পারমিশন দিবে) */}
                          {userRole === 'Admin' && item.authorityPermission && (
                            <div className="flex gap-2">
                              <button onClick={(e) => changeStatus(item.id, 'In Progress', 'bg-blue-500/20 text-blue-400 border-blue-500/30', e)} className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold px-4 py-2 rounded-xl border border-blue-500/30 transition">
                                ⚙️ Mark In Progress
                              </button>
                              <button onClick={(e) => changeStatus(item.id, 'Resolved', 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', e)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg">
                                ✅ Mark Solved
                              </button>
                            </div>
                          )}

                          {userRole === 'Admin' && !item.authorityPermission && (
                            <span className="text-xs text-amber-500 font-medium italic bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/10">🔒 Awaiting Authority permission to act on this case.</span>
                          )}

                          {userRole === 'Student' && (
                            <span className="text-xs text-gray-500 italic">You can only monitor the real-time status of your ticket.</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-gray-500 pt-2 border-t border-gray-800/40 flex justify-between items-center">
                      <span>Submitted on {item.date}</span>
                      {!isExpanded && <span className="text-indigo-400/70 text-xs font-medium">Click to manage case ↓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB ২: ANALYTICS OVERVIEW */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/60 p-5 rounded-2xl border border-gray-800"><span className="text-xs text-gray-400 block mb-1">Total Cases</span><strong className="text-3xl font-bold text-white font-mono">{totalComplaints}</strong></div>
                <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/10"><span className="text-xs text-amber-400 block mb-1">Pending</span><strong className="text-3xl font-bold text-amber-400 font-mono">{pendingCount}</strong></div>
                <div className="bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10"><span className="text-xs text-blue-400 block mb-1">In Progress</span><strong className="text-3xl font-bold text-blue-400 font-mono">{inProgressCount}</strong></div>
                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10"><span className="text-xs text-emerald-400 block mb-1">Solved</span><strong className="text-3xl font-bold text-emerald-400 font-mono">{resolvedCount}</strong></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-300">Resolution Efficiency Rate</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-gray-400">Fixed Rate</span><span className="text-indigo-400 font-semibold">{resolutionRate}%</span></div>
                    <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-500" style={{ width: `${resolutionRate}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-300">Category Density</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs"><span className="text-gray-400">📚 Academic</span><span className="text-gray-300 font-mono">{academicCount}</span></div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden"><div className="bg-indigo-500 h-full" style={{ width: `${totalComplaints > 0 ? (academicCount/totalComplaints)*100 : 0}%` }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs"><span className="text-gray-400">🏢 Infrastructure</span><span className="text-gray-300 font-mono">{infraCount}</span></div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden"><div className="bg-sky-500 h-full" style={{ width: `${totalComplaints > 0 ? (infraCount/totalComplaints)*100 : 0}%` }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB ৩: SYSTEM SETTINGS (পাসওয়ার্ড চেঞ্জ এবং শো/হাইড আইকন সহ) */}
          {activeTab === 'settings' && (
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-8">
              
              {/* পাসওয়ার্ড ম্যানেজার সেকশন */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-3">🔐 Account Security Settings</h3>
                
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition pr-10"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs"
                      >
                        {showPassword ? '👁️ Hide' : '👁️‍🗨️ Show'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">New Secure Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition pr-10"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10">
                    Update Account Password
                  </button>

                  {settingsMessage && (
                    <p className="text-xs font-medium pt-1 transition-all">{settingsMessage}</p>
                  )}
                </form>
              </div>

              {/* সিস্টেম অপশনস */}
              <div className="space-y-4 pt-4 border-t border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300">Preferences</h3>
                <div className="flex items-center justify-between p-3 bg-gray-950/40 border border-gray-800 rounded-xl max-w-xl">
                  <div>
                    <strong className="text-sm font-medium text-gray-200 block">System Web Notifications</strong>
                    <span className="text-xs text-gray-500">Live trigger state processing.</span>
                  </div>
                  <input type="checkbox" checked={emailNotify} onChange={() => setEmailNotify(!emailNotify)} className="w-4 h-4 text-indigo-600 bg-gray-800 border-gray-700 rounded focus:ring-indigo-500" />
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}