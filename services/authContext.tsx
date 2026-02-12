import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthSession, User, UserRole } from '../types';
import { db } from './db';

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem('marketnest_session');
    if (stored) {
      setSession(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));
    
    const user = await db.users.findByEmail(email);
    
    // In a real app, you would hash the input password and compare
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Remove password from session state for security best practice (even in mock)
    const { password: _, ...safeUser } = user;
    
    const newSession = { user: safeUser as User, token: 'fake-jwt-token' };
    setSession(newSession);
    localStorage.setItem('marketnest_session', JSON.stringify(newSession));
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));

    const existing = await db.users.findByEmail(email);
    if (existing) throw new Error('Email already exists');

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role,
      createdAt: new Date().toISOString()
    };

    await db.users.create(newUser);
    
    // Remove password from session
    const { password: _, ...safeUser } = newUser;

    const newSession = { user: safeUser as User, token: 'fake-jwt-token' };
    setSession(newSession);
    localStorage.setItem('marketnest_session', JSON.stringify(newSession));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('marketnest_session');
    window.location.hash = ''; // Redirect to home
  };

  const updateProfile = async (name: string) => {
    if(!session) return;
    const updatedUser = await db.users.update(session.user.id, { name });
    const { password: _, ...safeUser } = updatedUser;
    const newSession = { ...session, user: safeUser as User };
    setSession(newSession);
    localStorage.setItem('marketnest_session', JSON.stringify(newSession));
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};