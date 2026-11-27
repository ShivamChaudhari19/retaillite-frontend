import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/api/client';
import { AuthSession } from '@/shared/types';

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = apiClient.getAuthSession();
    setAuth(session);
    setIsLoading(false);
  }, []);

  const logout = () => {
    apiClient.clearAuthSession();
    setAuth(null);
    window.location.href = '/login';
  };

  const isAuthenticated = apiClient.isAuthenticated();
  const isAdmin= auth?.role.includes('ROLE_ADMIN')? true: false;

  return {
    auth,
    isLoading,
    isAuthenticated,
    isAdmin,
    logout,
  };
};
