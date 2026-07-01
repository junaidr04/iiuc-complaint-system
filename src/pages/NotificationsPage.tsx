import React from 'react';

export default function NotificationsPage() {
  const mockNotifications = [
    { id: 1, text: 'Admin updated your issue regarding WiFi status to "In Progress"', time: '2 hours ago' },
    { id: 2, text: 'New announcement: End semester examination schedules published', time: '1 day ago' },
    { id: 3, text: 'Welcome to your digital university grievance cell dashboard!', time: '3 days ago' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-gray-400 text-sm mt-1">Stay updated with latest activity logs</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl divide-y divide-gray-700 overflow-hidden">
        {mockNotifications.map((noti) => (
          <div key={noti.id} className="p-4 flex items-start gap-4 hover:bg-gray-700/30 transition">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-medium text-sm shrink-0 mt-0.5">
              🔔
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-200 font-medium">{noti.text}</p>
              <span className="text-xs text-gray-500 block mt-1">{noti.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}