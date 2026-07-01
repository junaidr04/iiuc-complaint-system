import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, GraduationCap } from 'lucide-react';

/**
 * OAuth redirect callback page.
 * Supabase redirects here after Google sign-in.
 * Waits for session then redirects to role-appropriate dashboard.
 */
const AuthCallback: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && role) {
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'authority') navigate('/authority', { replace: true });
      else navigate('/dashboard', { replace: true });
    } else if (!isLoading) {
      // Not authenticated after callback — something went wrong
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, role, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
        <GraduationCap className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Completing sign in...
      </div>
    </div>
  );
};

export default AuthCallback;
