import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { User, AuthResponse } from '../services/authService';
import { ROUTES, STORAGE_KEYS } from '../utils/constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      const savedUser = authService.getUser();

      if (token && savedUser) {
        setUser(savedUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleAuthResponse = (data: AuthResponse) => {
    authService.saveToken(data.token);
    authService.saveUser(data.user);
    setUser(data.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password);
    handleAuthResponse(data);
    navigate(ROUTES.DASHBOARD);
  }, [navigate]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await authService.register(name, email, password);
    handleAuthResponse(data);
    navigate(ROUTES.DASHBOARD);
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  const updateUser = useCallback((updatedUser: User) => {
    authService.saveUser(updatedUser);
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
