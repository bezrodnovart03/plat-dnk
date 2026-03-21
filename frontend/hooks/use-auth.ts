// hooks/use-auth.ts
import { useEffect, useState } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'psychologist' | 'admin';
  isActive: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await authAPI.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}