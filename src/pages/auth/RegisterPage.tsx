import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDepartments } from '@/services/api';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Student',
    department: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load departments on mount
  useEffect(() => {
    getDepartments()
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Error fetching departments:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      // Direct call to our updated signUp context function
      await signUp({
        name: formData.fullName,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        password: formData.password
      });

      // Successfully authenticated/bypassed, push to dashboard
      navigate('/');
    } catch (err: any) {
      // FIX: Safe error handling without crash-prone destructuring
      console.error(err);
      setError(err?.message || 'Something went wrong during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-2">Create account</h2>
        <p className="text-gray-400 mb-6">Fill in your details to get started</p>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              className="w-full p-2.5 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full p-2.5 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              name="role"
              className="w-full p-2.5 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Student">Student</option>
              <option value="Authority">Authority</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Department</label>
            <select
              name="department"
              required
              className="w-full p-2.5 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="">Select department</option>
              {departments.map((dept: any) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
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
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="w-full p-2.5 bg-gray-700 rounded border border-gray-600 focus:outline-none"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 rounded font-medium mt-4 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}