import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import { User } from '../types/sports';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, redirectTo?: string | false) => Promise<void>;
  register: (email: string, password: string, name: string, redirectTo?: string | false) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isLoginModalOpen: boolean;
  loginModalMessage: string;
  openLoginModal: (message?: string, onAuthenticated?: () => void) => void;
  closeLoginModal: () => void;
  requireAuth: (action: () => void, message?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('Sign in to follow teams and receive personalized updates.');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sports_access_token') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data: any = await api.get('/auth/me');
      if (data) {
        setUser(data);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, redirectTo: string | false = '/') => {
    const res: any = await api.post('/auth/login', { email, password });
    if (res?.tokens?.accessToken) {
      localStorage.setItem('sports_access_token', res.tokens.accessToken);
      if (res.tokens.refreshToken) {
        localStorage.setItem('sports_refresh_token', res.tokens.refreshToken);
      }
    }
    setUser(res.user);
    closeLoginModal();

    // If pending callback action was queued, resume it
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      action();
    }

    if (redirectTo !== false && redirectTo) {
      router.push(redirectTo);
    }
  };

  const register = async (email: string, password: string, name: string, redirectTo: string | false = '/') => {
    const res: any = await api.post('/auth/register', { email, password, name });
    if (res?.tokens?.accessToken) {
      localStorage.setItem('sports_access_token', res.tokens.accessToken);
      if (res.tokens.refreshToken) {
        localStorage.setItem('sports_refresh_token', res.tokens.refreshToken);
      }
    }
    setUser(res.user);
    closeLoginModal();

    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      action();
    }

    if (redirectTo !== false && redirectTo) {
      router.push(redirectTo);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('sports_access_token');
      localStorage.removeItem('sports_refresh_token');
      setUser(null);
      setPendingAction(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const data: any = await api.get('/users/me');
      if (data) {
        setUser(data);
      }
    } catch (err) {}
  };

  const openLoginModal = (message?: string, onAuthenticated?: () => void) => {
    if (message) setLoginModalMessage(message);
    if (onAuthenticated) setPendingAction(() => onAuthenticated);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const requireAuth = (action: () => void, message?: string) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      openLoginModal(message || 'Sign in to follow teams and receive personalized updates.', action);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        isLoginModalOpen,
        loginModalMessage,
        openLoginModal,
        closeLoginModal,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
