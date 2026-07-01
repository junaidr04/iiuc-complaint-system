import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function SidebarNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role || savedUser?.role || 'Student';

  return (
    <div className="w-64 bg-gray-800 min-h-screen p-4 flex flex-col justify-between border-r border-gray-700">
      <div>
        <div className="mb-8 px-2">
          <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
            🎓 UniCMS
          </h2>
          <p className="text-xs text-gray-400 mt-1">Logged in as {role}</p>
        </div>

        <nav className="space-y-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => `block p-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            📊 Dashboard
          </NavLink>

          {role === 'Student' && (
            <>
              <NavLink 
                to="/submit-complaint" 
                className={({ isActive }) => `block p-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                📝 Submit Complaint
              </NavLink>
              <NavLink 
                to="/my-complaints" 
                className={({ isActive }) => `block p-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                🗂️ My Complaints
              </NavLink>
            </>
          )}

          {role === 'Admin' && (
            <>
              <NavLink 
                to="/admin/complaints" 
                className={({ isActive }) => `block p-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                📋 All Complaints
              </NavLink>
              <NavLink 
                to="/admin/users" 
                className={({ isActive }) => `block p-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                👥 Manage Users
              </NavLink>
              <NavLink 
                to="/admin/analytics" 
                className={({ isActive }) => `block p-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                📈 Analytics
              </NavLink>
            </>
          )}

          <NavLink 
            to="/notifications" 
            className={({ isActive }) => `block p-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            🔔 Notifications
          </NavLink>
        </nav>
      </div>

      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="w-full p-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-sm font-medium transition mt-auto"
      >
        🚪 Logout
      </button>
    </div>
  );
}

export default SidebarNav;