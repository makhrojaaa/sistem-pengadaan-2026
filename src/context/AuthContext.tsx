import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildUser(supabaseUser: any): User {
  const email = supabaseUser.email || '';
  return {
    id: supabaseUser.id,
    email,
    name: supabaseUser.user_metadata?.full_name || email.split('@')[0] || 'Pengguna',
    nip: supabaseUser.user_metadata?.nip,
    role: supabaseUser.user_metadata?.role || 'Administrator PBJ',
    instansi: supabaseUser.user_metadata?.instansi || 'BPS Kabupaten Tanah Datar',
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore existing Supabase session (if any)
    const checkSession = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            setUser(buildUser(data.session.user));
          }
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
      if (!isSupabaseConfigured || !supabase) {
        setIsLoading(false);
        return { success: false, error: 'Database belum dikonfigurasi. Hubungi administrator.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data?.user) {
        setIsLoading(false);
        return { success: false, error: error?.message || 'Email atau password salah.' };
      }

      setUser(buildUser(data.user));
      setIsLoading(false);
      return { success: true };
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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
