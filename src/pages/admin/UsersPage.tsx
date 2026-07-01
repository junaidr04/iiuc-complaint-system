import React from 'react';

export default function UsersPage() {
  const mockUsers = [
    { name: 'Junaid Bin Jahangir', email: 'junaid@iiuc.ac.bd', role: 'Student', dept: 'CSE', joined: '2026-02-15' },
    { name: 'Dr. Shah Alam', email: 'shahalam@iiuc.ac.bd', role: 'Authority', dept: 'Academic Cell', joined: '2024-01-10' },
    { name: 'Admin Sparrow', email: 'admin@unicms.com', role: 'Admin', dept: 'IT Services', joined: '2025-12-01' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users Management</h1>
        <p className="text-gray-400 text-sm mt-1">{mockUsers.length} total active users</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-700 text-gray-300 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Department</th>
                <th className="p-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/60 text-sm text-gray-200">
              {mockUsers.map((user, idx) => (
                <tr key={idx} className="hover:bg-gray-700/20 transition">
                  <td className="p-4">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      user.role === 'Admin' ? 'bg-red-500/10 text-red-400' :
                      user.role === 'Authority' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-700 text-gray-300'
                    }`}>{user.role}</span>
                  </td>
                  <td className="p-4 text-gray-300">{user.dept}</td>
                  <td className="p-4 text-gray-400 font-mono text-xs">{user.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}