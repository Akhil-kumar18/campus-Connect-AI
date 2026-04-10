import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole, additionalData?: any) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: User[] = [
  { id: '1', name: 'John Student', email: 'student@campus.edu', role: 'student', createdAt: new Date() },
  { id: '2', name: 'Dr. Sarah Faculty', email: 'faculty@campus.edu', role: 'faculty', createdAt: new Date() },
  { id: '3', name: 'Admin User', email: 'admin@campus.edu', role: 'admin', createdAt: new Date() },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('campusconnect_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('campusconnect_token', data.token);
      localStorage.setItem('campusconnect_user', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole, additionalData: any = {}): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, ...additionalData }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('campusconnect_token', data.token);
      localStorage.setItem('campusconnect_user', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('campusconnect_token');
    localStorage.removeItem('campusconnect_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
