import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Direct call to updated signIn function
      await signIn(formData.email, formData.password);
      
      // Successfully logged in/bypassed, redirecting to dashboard
      navigate('/');
    } catch (err: any) {
      // FIX: Safe error handling to prevent destructure crash
      console.error(err);
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-2 text-center">Welcome back</h2>
        <p className="text-gray-400 mb-6 text-center">Sign in to your account</p>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full p-2.5 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@university.edu"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full p-2.5 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 rounded font-medium mt-4 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account? <Link to="/register" className="text-indigo-400 hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}