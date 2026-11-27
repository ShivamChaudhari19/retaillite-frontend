import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { AuthRequest, AuthResponse, UserRequest, UserResponse, AuthSession, UserRole } from '@/shared/types';

const client = apiClient.getClient();

export const authAPI = {
  login: async (credentials: AuthRequest): Promise<AuthResponse> => {
    const { data } = await client.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (payload: UserRequest): Promise<UserResponse> => {
    const { data } = await client.post<UserResponse>('/user/register', payload);
    return data;
  },
};

export const useLogin = () => {
  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      const session: AuthSession = {
        token: data.token,
        username: data.username,
        role: data.role.map((r) => r as UserRole),
        // role: data.role.map((r) => r.replace('ROLE_', '') as any),
      };
      apiClient.setAuthSession(session);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authAPI.register,
  });
};
