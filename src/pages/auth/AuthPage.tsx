import React, { useState } from 'react';

export default function AuthPage() {
  // state tracking: 'login' নাকি 'register' মোড
  const [isLoginView, setIsLoginView] = useState(true);

  // ইনপুট ফিল্ড স্টেটসমূহ
  const [userIdOrRole, setUserIdOrRole] = useState('');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [registerStudentId, setRegisterStudentId] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ১. আপনার দেওয়া স্টুডেন্ট রেজিস্ট্রেশন সাবমিট করার রিয়েল লজিক (শুধু স্টুডেন্ট পারবে)
  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName || !registerStudentId || !registerPassword) {
      alert("Please fill in all fields!");
      return;
    }

    const existingStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
    
    // চেক করা যে স্টুডেন্ট আইডি আগে থেকেই এক্সিস্ট করে কিনা
    if (existingStudents.find((s: any) => s.studentId === registerStudentId)) {
      alert("This student ID is already registered!");
      return;
    }

    // নতুন স্টুডেন্ট ডাটা পুশ করা
    existingStudents.push({
      studentId: registerStudentId,
      name: studentName,
      password: registerPassword, 
      role: 'Student'
    });

    localStorage.setItem('registered_students', JSON.stringify(existingStudents));
    alert("Registration Successful! Now you can log in infinite times.");
    
    // রেজিস্ট্রেশন শেষে লগইন ভিউতে ব্যাক করা এবং ফিল্ড ক্লিয়ার করা
    setIsLoginView(true);
    setUserIdOrRole(registerStudentId);
    setStudentName('');
    setRegisterStudentId('');
    setRegisterPassword('');
  };

  // ২. আপনার দেওয়া ইউনিভার্সাল লগইন চেক লজিক (Admin, Authority, and Registered Students)
  const handleLoginCheck = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userIdOrRole || !password) {
      alert("Please enter both credentials!");
      return;
    }

    // ক) ফিক্সড এডমিন ও অথরিটি অ্যাকাউন্ট (রেজিস্ট্রেশন ছাড়া সরাসরি লগইন)
    if (userIdOrRole.toLowerCase() === 'admin' && password === (localStorage.getItem('pwd_admin') || 'admin123')) {
      localStorage.setItem('user_role', 'Admin');
      window.location.href = '/admin/complaints'; // আপনার ড্যাশবোর্ড রাউট
      return;
    }
    if (userIdOrRole.toLowerCase() === 'authority' && password === (localStorage.getItem('pwd_authority') || 'auth123')) {
      localStorage.setItem('user_role', 'Authority');
      window.location.href = '/admin/complaints'; // আপনার ড্যাশবোর্ড রাউট
      return;
    }

    // খ) ডাইনামিক রেজিস্টার্ড স্টুডেন্ট ভ্যালিডেশন চেক
    const students = JSON.parse(localStorage.getItem('registered_students') || '[]');
    const matchedStudent = students.find((s: any) => s.studentId === userIdOrRole && s.password === password);

    if (matchedStudent) {
      localStorage.setItem('user_role', 'Student');
      localStorage.setItem('student_session_id', matchedStudent.studentId);
      localStorage.setItem('student_session_name', matchedStudent.name);
      window.location.href = '/admin/complaints'; 
    } else {
      alert("❌ Invalid Credentials or Account doesn't exist!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-100 p-4 font-sans">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        
        {/* টপ ব্র্যান্ডিং লোগো */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-xl bg-indigo-600 items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-600/20">U</div>
          <h2 className="text-2xl font-bold text-white tracking-tight">UniCMS Portal</h2>
          <p className="text-xs text-gray-400">University Complaint Management System</p>
        </div>

        {/* লজিক্যাল ভিউ রেন্ডারিং */}
        {isLoginView ? (
          /* ==================== LOGIN FORM ==================== */
          <form onSubmit={handleLoginCheck} className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider text-center">Account Login</h3>
            
            <div>
              <label className="text-xs text-gray-400 block mb-1">User ID / Role Key</label>
              <input 
                type="text" 
                placeholder="e.g. C211045, admin, or authority" 
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition"
                value={userIdOrRole}
                onChange={e => setUserIdOrRole(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition text-sm shadow-lg shadow-indigo-600/10">
              Sign In to System
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                New Student?{' '}
                <button type="button" onClick={() => { setIsLoginView(false); setShowPassword(false); }} className="text-indigo-400 hover:underline font-medium">
                  Create Student Account
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* ==================== STUDENT REGISTRATION FORM ==================== */
          <form onSubmit={handleStudentRegister} className="space-y-4">
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider text-center">🔒 Student Registration Only</h3>
            <p className="text-[11px] text-gray-500 text-center bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">Admin & Authority roles cannot register from here. Use predefined credentials.</p>
            
            <div>
              <label className="text-xs text-gray-400 block mb-1">Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. Junaid Bin Jahangir"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Student ID</label>
              <input 
                type="text" 
                placeholder="e.g. C211045" 
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition font-mono"
                value={registerStudentId}
                onChange={e => setRegisterStudentId(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Create Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition"
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-2.5 rounded-xl transition text-sm shadow-md">
              Register Secure Account
            </button>

            <div className="text-center pt-2">
              <button type="button" onClick={() => { setIsLoginView(true); setShowPassword(false); }} className="text-xs text-gray-400 hover:text-gray-200 underline">
                Back to Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}