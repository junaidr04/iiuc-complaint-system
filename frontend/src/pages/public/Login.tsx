import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { GraduationCap, Shield, UserCheck, Lock, Mail, ArrowRight, User, HelpCircle, X, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, forgotPassword } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = await login(email, password, selectedRole);
    setIsSubmitting(false);

    if (result.success) {
      if (selectedRole === 'admin') onNavigate('admin-dashboard');
      else if (selectedRole === 'staff') onNavigate('staff-dashboard');
      else onNavigate('student-dashboard');
    } else {
      setErrorMessage(result.error || 'Authentication failed.');
    }
  };

  const handleFillDemo = (role: UserRole) => {
    handleRoleChange(role);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setIsResetting(true);
    setResetMessage('');
    const res = await forgotPassword(resetEmail);
    setIsResetting(false);
    if (res.success) {
      setResetMessage(res.message || 'Password reset link sent to your email address.');
    } else {
      setResetMessage(res.error || 'Failed to process password reset.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto font-bold shadow-md shadow-blue-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Sign In to CCMS Portal</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Campus Complaint Management System</p>
        </div>

        {/* 1. Role Selector Tabs */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
            Select Your Role
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'student'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Student
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('staff')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'staff'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Staff
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'admin'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>
        </div>

        {/* Role Notice */}
        {selectedRole !== 'student' && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            ℹ️ <span className="font-bold">{selectedRole.toUpperCase()}</span> registration is restricted. Accounts are managed by Central Administration. Enter your assigned portal credentials below.
          </p>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-800 dark:text-rose-200">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {selectedRole === 'student' ? 'Student Email' : selectedRole === 'staff' ? 'Staff Email' : 'Admin Email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'student' ? 'student@campus.com' : selectedRole === 'staff' ? 'staff@campus.com' : 'admin@campus.com'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => {
                  if (email && !resetEmail) setResetEmail(email);
                  setIsForgotOpen(true);
                }}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'admin'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : selectedRole === 'staff'
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
            }`}
          >
            {isSubmitting ? 'Authenticating...' : `Sign In as ${selectedRole.toUpperCase()}`} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Register Link (Student Only) */}
        {selectedRole === 'student' && (
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            New Student?{' '}
            <button onClick={() => onNavigate('register')} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Register Student Account
            </button>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setIsForgotOpen(false);
                setResetMessage('');
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Reset {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your registered {selectedRole} email address to receive password recovery instructions.
              </p>
            </div>

            {resetMessage ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{resetMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Email
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder={selectedRole === 'student' ? 'student@campus.com' : selectedRole === 'staff' ? 'staff@campus.com' : 'admin@campus.com'}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  {isResetting ? 'Sending Link...' : 'Send Password Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
