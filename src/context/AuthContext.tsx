import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import api, {
  getApiErrorMessage,
  registerUnauthorizedHandler,
  TOKEN_STORAGE_KEY,
} from '../services/api.ts';
import type { AuthUser } from '../types/index.ts';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  adminConfigured: boolean | null;
  login: (username: string, password: string) => Promise<AuthUser>;
  setupAdmin: (username: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminConfigured, setAdminConfigured] = useState<boolean | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const res = await api.get<{ adminConfigured: boolean }>('/auth/status');
      setAdminConfigured(res.data.adminConfigured);
    } catch {
      setAdminConfigured(true);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setUser(null);
      return;
    }
    const res = await api.get<{ user: AuthUser }>('/auth/me');
    setUser(res.data.user);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
    });

    let active = true;
    async function bootstrap() {
      try {
        await checkAuthStatus();
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
          const res = await api.get<{ user: AuthUser }>('/auth/me');
          if (active) {
            setUser(res.data.user);
          }
        }
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [checkAuthStatus]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await api.post<{ token: string; user: AuthUser }>(
        '/auth/login',
        { username, password }
      );
      localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Unable to sign in.'));
    }
  }, []);

  const setupAdmin = useCallback(
    async (username: string, password: string) => {
      try {
        const res = await api.post<{ message: string }>('/auth/setup-admin', {
          username,
          password,
        });
        setAdminConfigured(true);
        return res.data.message;
      } catch (err) {
        throw new Error(
          getApiErrorMessage(err, 'Unable to configure admin account.')
        );
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        await api.post('/auth/logout');
      }
    } catch {
      // Clear local session regardless of network errors during logout
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        adminConfigured,
        login,
        setupAdmin,
        logout,
        refreshUser,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return ctx;
}
