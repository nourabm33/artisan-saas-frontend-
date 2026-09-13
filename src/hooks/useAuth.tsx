'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, UNAUTHORIZED_EVENT } from '@/lib/api';
import { clearSession, getAccessToken, getStoredUser, saveSession } from '@/lib/auth';
import { errorMessage } from '@/lib/format';
import type { User } from '@/types';
import type { LoginBody, RegisterBody } from '@/types/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (data: LoginBody) => Promise<void>;
  register: (data: RegisterBody) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored && getAccessToken()) setUser(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      router.push('/login');
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [router]);

  const login = useCallback(
    async (data: LoginBody) => {
      setError(null);
      setLoading(true);
      try {
        const result = await api.auth.login(data);
        saveSession(result.user, result.tokens);
        setUser(result.user);
        router.push('/dashboard');
      } catch (err) {
        setError(errorMessage(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (data: RegisterBody) => {
      setError(null);
      setLoading(true);
      try {
        const result = await api.auth.register(data);
        saveSession(result.user, result.tokens);
        setUser(result.user);
        router.push('/dashboard');
      } catch (err) {
        setError(errorMessage(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, error, isAuthenticated: user !== null, login, register, logout }),
    [user, loading, error, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
