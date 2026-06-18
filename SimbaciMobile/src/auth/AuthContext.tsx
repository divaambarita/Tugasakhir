import React from 'react';

import {login as loginApi} from '../api/client';
import {
  clearCurrentUser,
  loadCurrentUser,
  saveCurrentUser,
} from './authStorage';
import type {CurrentUser} from './types';
import {onAuthExpired} from './authEvents';

const MOBILE_ALLOWED_ROLES = new Set(['nasabah', 'bsu', 'volunteer']);

const MOBILE_WEB_ONLY_ROLE_MESSAGE =
  'Akses Terbatas: Akun manajerial hanya dapat diakses melalui Dashboard Web. Silakan gunakan akun Nasabah, BSU, atau Volunteer untuk aplikasi Mobile Android.';

type AuthState = {
  isRestoring: boolean;
  user: CurrentUser | null;
  lastError: string | null;
};

type AuthContextValue = AuthState & {
  login: (noTelp: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [state, setState] = React.useState<AuthState>({
    isRestoring: true,
    user: null,
    lastError: null,
  });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadCurrentUser();
      if (cancelled) {
        return;
      }
      setState({isRestoring: false, user: stored, lastError: null});
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const clearError = React.useCallback(() => {
    setState(prev => ({...prev, lastError: null}));
  }, []);

  const login = React.useCallback(async (noTelp: string, password: string) => {
    setState(prev => ({...prev, lastError: null}));

    const res = await loginApi({noTelp, password});
    if (!res.success) {
      setState(prev => ({
        ...prev,
        lastError: res.message ?? 'Login failed',
      }));
      return;
    }

    const roleName = res.data?.roleName;
    if (!roleName || !MOBILE_ALLOWED_ROLES.has(roleName)) {
      await clearCurrentUser();
      setState(prev => ({
        ...prev,
        user: null,
        lastError: MOBILE_WEB_ONLY_ROLE_MESSAGE,
      }));
      return;
    }

    await saveCurrentUser(res.data);
    setState(prev => ({...prev, user: res.data, lastError: null}));
  }, []);

  const logout = React.useCallback(async () => {
    await clearCurrentUser();
    setState(prev => ({...prev, user: null, lastError: null}));
  }, []);

  const forceLogout = React.useCallback(async (message?: string) => {
    await clearCurrentUser();
    setState(prev => ({
      ...prev,
      user: null,
      lastError: message ?? 'Sesi login habis. Silakan login ulang.',
    }));
  }, []);

  React.useEffect(() => {
    return onAuthExpired(() => {
      // Ensure we always end up at Login when the token expires.
      // RootNavigator will render the Login stack when `user` becomes null.
      forceLogout().catch(() => {
        // ignore
      });
    });
  }, [forceLogout]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
