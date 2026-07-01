import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, UserRole } from '@/types/types';
import { api } from '@/services/api';

interface AuthContextValue {
    user: User | null;
    role: UserRole | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ error: Error | null }>;
    register: (
        name: string,
        email: string,
        password: string,
        role: UserRole,
        department_id?: string
    ) => Promise<{ error: Error | null }>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }
            const { data } = await api.get('/auth/me');
            setUser(data.user);
        } catch (err) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        await fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const login = async (email: string, password: string) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { error: null };
        } catch (err: any) {
            return { error: new Error(err?.response?.data?.message || 'Login failed') };
        }
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        role: UserRole,
        department_id?: string
    ) => {
        try {
            const { data } = await api.post('/auth/register', {
                name,
                email,
                password,
                role,
                department_id,
            });
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { error: null };
        } catch (err: any) {
            return { error: new Error(err?.response?.data?.message || 'Registration failed') };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                role: user?.role ?? null,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};