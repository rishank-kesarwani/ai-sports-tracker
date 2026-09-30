import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types/sports';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isLoginModalOpen: boolean;
  loginModalMessage: string;
  openLoginModal: (message?: string) => void;
  closeLoginModal: () => void;
  requireAuth: (action: () => void, message?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('Please sign in to personalize your sports dashboard.');

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
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

  const login = async (email: string, password: string) => {
    const res: any = await api.post('/auth/login', { email, password });
    if (res?.tokens?.accessToken) {
      localStorage.setItem('sports_access_token', res.tokens.accessToken);
      if (res.tokens.refreshToken) {
        localStorage.setItem('sports_refresh_token', res.tokens.refreshToken);
      }
    }
    setUser(res.user);
    closeLoginModal();
  };

  const register = async (email: string, password: string, name: string) => {
    const res: any = await api.post('/auth/register', { email, password, name });
    if (res?.tokens?.accessToken) {
      localStorage.setItem('sports_access_token', res.tokens.accessToken);
      if (res.tokens.refreshToken) {
        localStorage.setItem('sports_refresh_token', res.tokens.refreshToken);
      }
    }
    setUser(res.user);
    closeLoginModal();
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

  const openLoginModal = (message?: string) => {
    if (message) setLoginModalMessage(message);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const requireAuth = (action: () => void, message?: string) => {
    if (user) {
      action();
    } else {
      openLoginModal(message || 'Authentication is required to perform this action.');
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
