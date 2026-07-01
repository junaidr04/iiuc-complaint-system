import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student'); // Default role Student
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ১. অ্যাডমিনের জন্য ফিক্সড জিমেইল ভ্যালিডেশন
    if (role === 'Admin' && email !== 'admin@gmail.com') {
      setError('Access Denied! Only admin@gmail.com can log in as Admin.');
      return;
    }

    // ২. অথরিটির জন্য ফিক্সড জিমেইল ভ্যালিডেশন
    if (role === 'Authority' && email !== 'iiuc@gmail.com') {
      setError('Access Denied! Only iiuc@gmail.com can log in as Authority.');
      return;
    }

    // ৩. পাসওয়ার্ড চেক (কমপক্ষে ৪ ক্যারেক্টার)
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    // সফলভাবে লগইন হলে লোকাল স্টোরেজে রোল এবং ইমেইল সেট করা হচ্ছে
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_email', email);

    // রিডাইরেক্ট লজিক (লগইন করার সাথে সাথে ফোর্সড রিলোড দিয়ে সঠিক প্যানেলে পাঠানো হচ্ছে)
    if (role === 'Admin') {
      window.location.replace('/admin/complaints');
      setTimeout(() => window.location.reload(), 100);
    } else if (role === 'Authority') {
      window.location.replace('/admin/complaints'); // অথবা আপনার অথরিটি স্পেসিফিক রুট থাকলে সেটি দিন
      setTimeout(() => window.location.reload(), 100);
    } else {
      window.location.replace('/student/dashboard');
      setTimeout(() => window.location.reload(), 100);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">UniCMS</h1>
          <p className="text-gray-400 text-sm mt-2">Log in to your account to continue</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-medium animate-fadeIn">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Select Role</label>
            <div className="grid grid-cols-3 gap-2">
              {['Student', 'Authority', 'Admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    role === r
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                  onClick={() => {
                    setRole(r);
                    setError('');
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Email Address</label>
            <input
              required
              type="email"
              placeholder={
                role === 'Admin' ? 'admin@gmail.com' : 
                role === 'Authority' ? 'iiuc@gmail.com' : 'student@example.com'
              }
              className="w-full bg-gray-950 border border-gray-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              className="w-full bg-gray-950 border border-gray-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition mt-2 shadow-lg shadow-indigo-600/10"
          >
            Sign In as {role}
          </button>
        </form>
      </div>
    </div>
  );
}