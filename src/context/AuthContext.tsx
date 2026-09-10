import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUserRole?: (role: User['role']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_AUTH_USER = 'SPP_AUTH_USER_SESSION';

const DEMO_USERS: Record<string, User> = {
  'pejabat.pbj@bps.go.id': {
    id: 'usr-pejabat-01',
    email: 'pejabat.pbj@bps.go.id',
    name: 'Firdaus, SST, M.T',
    nip: '198205142005011002',
    role: 'Pejabat Pengadaan',
    instansi: 'BPS Kabupaten Tanah Datar',
  },
  'admin.pengadaan@bps.go.id': {
    id: 'usr-admin-01',
    email: 'admin.pengadaan@bps.go.id',
    name: 'Drs. Hendra Setiawan, M.Si',
    nip: '197908152003121002',
    role: 'Administrator PBJ',
    instansi: 'BPS Kabupaten Tanah Datar',
  },
  'pejabat.pbj@instansi.go.id': {
    id: 'usr-pejabat-02',
    email: 'pejabat.pbj@instansi.go.id',
    name: 'Firdaus, SST, M.T',
    nip: '198205142005011002',
    role: 'Pejabat Pengadaan',
    instansi: 'BPS Kabupaten Tanah Datar',
  },
  'admin.pengadaan@instansi.go.id': {
    id: 'usr-admin-02',
    email: 'admin.pengadaan@instansi.go.id',
    name: 'Drs. Hendra Setiawan, M.Si',
    nip: '197908152003121002',
    role: 'Administrator PBJ',
    instansi: 'BPS Kabupaten Tanah Datar',
  },
  'auditor.inspektorat@instansi.go.id': {
    id: 'usr-auditor-03',
    email: 'auditor.inspektorat@instansi.go.id',
    name: 'Bambang Triatmojo, S.E., Ak., CA',
    nip: '198111042006041001',
    role: 'Auditor / Pengawas',
    instansi: 'BPS Kabupaten Tanah Datar',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check existing session
    const checkSession = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const email = data.session.user.email || 'user@bps.go.id';
            const existing = DEMO_USERS[email.toLowerCase()] || {
              id: data.session.user.id,
              email: email,
              name: data.session.user.user_metadata?.full_name || email.split('@')[0],
              role: 'Administrator PBJ',
              instansi: 'BPS Kabupaten Tanah Datar',
            };
            setUser(existing);
            setIsLoading(false);
            return;
          }
        }

        const saved = localStorage.getItem(STORAGE_AUTH_USER);
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.instansi = 'BPS Kabupaten Tanah Datar';
          if (parsed.role === 'Pejabat Pengadaan' || parsed.email?.includes('pejabat')) {
            parsed.name = 'Firdaus, SST, M.T';
          }
          setUser(parsed);
          localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(parsed));
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // 1. Try Supabase Auth if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!error && data?.user) {
            const authenticatedUser: User = DEMO_USERS[email.toLowerCase()] || {
              id: data.user.id,
              email: data.user.email || email,
              name: data.user.user_metadata?.full_name || email.split('@')[0],
              role: 'Administrator PBJ',
              instansi: 'BPS Kabupaten Tanah Datar',
            };
            setUser(authenticatedUser);
            localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(authenticatedUser));
            setIsLoading(false);
            return { success: true };
          }
        } catch (supabaseErr) {
          console.warn('Supabase auth error, checking demo credentials:', supabaseErr);
        }
      }

      // 2. Standard Official Administrative Demo Authentication
      // Valid credentials: any demo email with any password (or 'admin123', 'pbj2026', etc.)
      const normalizedEmail = email.trim().toLowerCase();
      const matchedUser = DEMO_USERS[normalizedEmail];

      if (matchedUser && password.length >= 4) {
        setUser(matchedUser);
        localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(matchedUser));
        setIsLoading(false);
        return { success: true };
      }

      // If user enters custom institutional email with valid password
      if (normalizedEmail.includes('@') && password.length >= 4) {
        const customUser: User = {
          id: `usr-${Date.now()}`,
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0].toUpperCase(),
          role: 'Administrator PBJ',
          instansi: 'BPS Kabupaten Tanah Datar',
        };
        setUser(customUser);
        localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(customUser));
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Email atau password salah.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Terjadi kesalahan sistem saat login.' };
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase signout warning:', err);
    }
    setUser(null);
    localStorage.removeItem(STORAGE_AUTH_USER);
  };

  const switchUserRole = (role: User['role']) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
