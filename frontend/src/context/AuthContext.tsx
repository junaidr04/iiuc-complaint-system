import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiFetch } from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (userData: Partial<User> & { password?: string; confirmPassword?: string }) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load saved session if exists
    const savedUser = localStorage.getItem('ccms_user');
    const savedToken = localStorage.getItem('ccms_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('ccms_user');
        localStorage.removeItem('ccms_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string, role?: UserRole): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('ccms_user', JSON.stringify(data.user));
      localStorage.setItem('ccms_token', data.token);

      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: 'Network error or server unavailable.' };
    }
  };

  const register = async (userData: Partial<User> & { password?: string; confirmPassword?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          role: 'student', // Registration strictly restricted to student role
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('ccms_user', JSON.stringify(data.user));
      localStorage.setItem('ccms_token', data.token);

      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: 'Network error or server unavailable.' };
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: 'Failed to request password reset.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ccms_user');
    localStorage.removeItem('ccms_token');
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await apiFetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...data }),
      });
      if (res.ok) {
        const result = await res.json();
        setUser(result.user);
        localStorage.setItem('ccms_user', JSON.stringify(result.user));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        forgotPassword,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};