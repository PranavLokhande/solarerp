import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoPersona: (roleKey: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_PERSONAS = [
  { role: 'Super Admin', email: 'admin@heliosops.com', label: 'Vikramaditya (Super Admin)' },
  { role: 'Sales Manager', email: 'sales.manager@heliosops.com', label: 'Ananya (Sales Manager)' },
  { role: 'Sales Executive', email: 'sales.exec@heliosops.com', label: 'Rohan (Sales Exec)' },
  { role: 'Site Survey Engineer', email: 'survey.eng@heliosops.com', label: 'Pooja (Survey Engineer)' },
  { role: 'Design Engineer', email: 'design.eng@heliosops.com', label: 'Aditya (Design Engineer)' },
  { role: 'Project Manager', email: 'project.mgr@heliosops.com', label: 'Sameer (Project Manager)' },
  { role: 'Installation Technician', email: 'tech.lead@heliosops.com', label: 'Nilesh (Technician)' },
  { role: 'Quality Assurance Engineer', email: 'qa.lead@heliosops.com', label: 'Kavita (QA Engineer)' },
  { role: 'Finance Manager', email: 'finance.mgr@heliosops.com', label: 'Rajiv (Finance Manager)' },
  { role: 'Warehouse Manager', email: 'warehouse.mgr@heliosops.com', label: 'Dinesh (Warehouse Mgr)' },
  { role: 'Customer', email: 'rajesh.sharma@gmail.com', label: 'Rajesh Sharma (Customer)' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('helios_access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('[Auth] Session expired or invalid:', err);
          localStorage.removeItem('helios_access_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(identifier, pass);
      localStorage.setItem('helios_access_token', res.accessToken);
      setToken(res.accessToken);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('helios_access_token');
      setToken(null);
      setUser(null);
    }
  };

  const switchDemoPersona = async (email: string) => {
    setIsLoading(true);
    try {
      const pass = email === 'admin@heliosops.com' ? 'Admin@2026' : email.includes('gmail.com') ? 'Customer@2026' : 'Solar@2026';
      await login(email, pass);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, switchDemoPersona }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
