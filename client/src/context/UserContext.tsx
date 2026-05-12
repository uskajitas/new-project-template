import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api, setCurrentEmail } from '../api';

export type Role = 'admin' | 'pro' | 'guest';

export interface AppUser {
  email: string;
  name: string;
  picture: string;
  role: Role;
  approved: boolean;
  createdAt: string;
  lastLoginAt: string;
}

interface UserCtx {
  user: AppUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<UserCtx | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!firebaseUser?.email) { setUser(null); setCurrentEmail(null); return; }
    setCurrentEmail(firebaseUser.email);
    setIsLoading(true);
    try {
      // upsert on the server, get back the canonical user row
      const u = await api.post<AppUser>('/api/auth/login', {
        email:   firebaseUser.email,
        name:    firebaseUser.displayName || '',
        picture: firebaseUser.photoURL    || '',
      });
      setUser(u);
    } catch (e) {
      console.error('[UserContext] /api/auth/login failed', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [firebaseUser?.email, firebaseUser?.displayName, firebaseUser?.photoURL]);

  useEffect(() => {
    if (isAuthenticated) refresh();
    else { setUser(null); setCurrentEmail(null); }
  }, [isAuthenticated, refresh]);

  return (
    <Ctx.Provider value={{ user, isLoading, isAdmin: user?.role === 'admin', refresh }}>
      {children}
    </Ctx.Provider>
  );
};

export function useAppUser(): UserCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppUser must be inside <UserProvider>');
  return v;
}
