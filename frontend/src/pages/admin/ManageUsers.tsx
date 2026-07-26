import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../../types';
import {
  Users,
  Plus,
  Search,
  UserCheck,
  Shield,
  GraduationCap,
  X,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('staff');
  const [newUserDepartment, setNewUserDepartment] = useState('IT & Network Cell');

  const fetchUsers = () => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((d) => setUsers(d.users || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        department: newUserDepartment,
      }),
    });
    if (res.ok) {
      setIsAddModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      fetchUsers();
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-600" /> Users & Staff Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage student credentials, department technicians & central administrators
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'student', 'staff', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl capitalize font-bold transition-all ${
                roleFilter === r
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {r}s
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 rounded-l-xl">User Name & Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Department / Session</th>
              <th className="p-3">Phone</th>
              <th className="p-3 rounded-r-xl text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="p-3 flex items-center gap-2.5">
                  <img src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{u.name}</span>
                    <span className="text-[11px] text-slate-400">{u.email}</span>
                  </div>
                </td>
                <td className="p-3 font-bold uppercase text-[10px]">
                  <span className={`px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-rose-100 text-rose-800' : u.role === 'staff' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3 font-medium text-slate-600 dark:text-slate-400">{u.department || 'Central Admin'}</td>
                <td className="p-3 text-slate-500">{u.phone || 'N/A'}</td>
                <td className="p-3 text-right">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full text-[10px]">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Provision New Staff / Admin</h3>
              <button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g., Dr. Marcus Vance"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="marcus.vance@university.edu"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Assign Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="staff">Department Staff / Technician</option>
                  <option value="admin">Central Administrator</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Department</label>
                <input
                  type="text"
                  value={newUserDepartment}
                  onChange={(e) => setNewUserDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md mt-2"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
