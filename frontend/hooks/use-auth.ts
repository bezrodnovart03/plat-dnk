'use client';

import { useEffect, useState } from 'react';
import { authAPI } from '@/lib/api';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // API уже возвращает data.user
      const userData = await authAPI.getCurrentUser();

      setUser({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        is_active: userData.is_active,
        expires_at: userData.expires_at,
        created_at: userData.created_at,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // API уже возвращает { token, user }
      const { token, user: userData } = await authAPI.login(email, password);

      localStorage.setItem('token', token);
      setUser({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        is_active: userData.is_active,
        expires_at: userData.expires_at,
        created_at: userData.created_at,
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}