import { useState } from 'react';
import { apiClient } from '@/shared/api/client';
import { AuthSession } from '@/shared/types';

export const useAuth = () => {
  // Read synchronously: previously isAdmin was false on the first render, which
  // made the sidebar flicker and would have redirected admins away from admin routes.
  const [auth, setAuth] = useState<AuthSession | null>(() => apiClient.getAuthSession());

  const logout = () => {
    apiClient.clearAuthSession();
    setAuth(null);
    window.location.replace('/login');
  };

  const isAuthenticated = apiClient.isAuthenticated();
  const isAdmin = auth?.role?.includes('ROLE_ADMIN') ?? false;

  return {
    auth,
    isLoading: false,
    isAuthenticated,
    isAdmin,
    logout,
  };
};
