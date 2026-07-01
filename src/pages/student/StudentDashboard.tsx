import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = savedUser?.name || 'Sparrow';

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Good evening, {userName} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here's an overview of your complaints and recent activity.</p>
        </div>
        <button 
          onClick={() => navigate('/submit-complaint')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition flex items-center gap-2"
        >
          <span>+</span> New Complaint
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Complaints', count: '2', color: 'text-indigo-400' },
          { title: 'Pending', count: '1', color: 'text-amber-400' },
          { title: 'In Progress', count: '1', color: 'text-blue-400' },
          { title: 'Resolved', count: '0', color: 'text-emerald-400' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-gray-800 border border-gray-700 p-6 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">{stat.title}</p>
              <h3 className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.count}</h3>
            </div>
            <div className="text-2xl bg-gray-700/50 p-2 rounded-lg">📊</div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notifications */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              🔔 Recent Notifications
            </h3>
            <button onClick={() => navigate('/notifications')} className="text-sm text-indigo-400 hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-700/50 text-sm text-gray-300">
              Your complaint <span className="text-indigo-400 font-medium">#CMS-8831</span> status updated to "In Progress".
            </div>
            <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-700/50 text-sm text-gray-300">
              Welcome to UniCMS! Your account registration was verified successfully.
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/submit-complaint')}
              className="w-full p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left text-sm font-medium transition flex items-center gap-3 text-gray-200"
            >
              📝 Submit a New Complaint
            </button>
            <button 
              onClick={() => navigate('/my-complaints')}
              className="w-full p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left text-sm font-medium transition flex items-center gap-3 text-gray-200"
            >
              🗂️ View My Complaints
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}