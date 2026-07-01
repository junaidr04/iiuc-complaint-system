import React, { useState } from 'react';

export default function SubmitComplaintPage() {
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    semester: '',
    department: 'CSE',
    title: '',
    category: 'Academic',
    description: ''
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newComplaint = {
      id: `CMS-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      status: 'Pending',
      statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      date: new Date().toISOString().split('T')[0],
      
      // স্টুডেন্টের এক্সট্রা ইনফো যা অ্যাডমিন ও অথরিটি দেখবে
      studentInfo: {
        name: formData.studentName,
        id: formData.studentId,
        semester: formData.semester,
        dept: formData.department
      },
      // অথরিটির পারমিশন ফ্ল্যাগ (শুরুতে false থাকবে)
      authorityPermission: false 
    };

    const saved = localStorage.getItem('user_complaints');
    const list = saved ? JSON.parse(saved) : [];
    list.unshift(newComplaint);
    localStorage.setItem('user_complaints', JSON.stringify(list));

    setSuccess(true);
    setFormData({ studentName: '', studentId: '', semester: '', department: 'CSE', title: '', category: 'Academic', description: '' });
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 border border-gray-700 p-6 rounded-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Submit a New Complaint</h2>
        <p className="text-gray-400 text-xs mt-1">Please provide accurate information for quick investigation.</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg animate-fadeIn">
          Complaint submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Info Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Your Full Name</label>
            <input required type="text" className="w-full bg-gray-900 border border-gray-700 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Student ID</label>
            <input required type="text" className="w-full bg-gray-900 border border-gray-700 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
          </div>
        </div>

        {/* Student Info Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Semester</label>
            <input required type="text" placeholder="e.g. 5th" className="w-full bg-gray-900 border border-gray-700 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Department</label>
            <select className="w-full bg-gray-900 border border-gray-700 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
              <option value="CSE">CSE</option>
              <option value="EEE">EEE</option>
              <option value="BBA">BBA</option>
              <option value="ELL">ELL</option>
            </select>
          </div>
        </div>

        {/* Complaint Details */}
        <div className="border-t border-gray-700/50 pt-4">
          <label className="block text-xs font-medium text-gray-400 mb-1">Complaint Title</label>
          <input required type="text" className="w-full bg-gray-900 border border-gray-700 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
            <select className="w-full bg-gray-900 border border-gray-700 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="Academic">Academic</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Hostel">Hostel</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Detailed Description</label>
          <textarea required rows={4} className="w-full bg-gray-900 border border-gray-700 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition">
          Submit Complaint
        </button>
      </form>
    </div>
  );
}