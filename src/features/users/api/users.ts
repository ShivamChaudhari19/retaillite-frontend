import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import {
  UserRequest,
  UserResponse,
  PagedUserResponse,
} from '@/shared/types';

const client = apiClient.getClient();

export const usersAPI = {
  list: async (page: number, size: number, sortBy: string, orderedBy: string) => {
    const { data } = await client.get<PagedUserResponse>('/user/users', {
      params: { page, size, sortBy, orderedBy },
    });
    return data;
  },

  create: async (payload: UserRequest) => {
    const { data } = await client.post<UserResponse>('/user/register', payload);
    return data;
  },

  delete: async (userId: string) => {
    await client.delete(`/user/${userId}`);
  },
};

export const useListUsers = (
  page: number,
  size: number,
  sortBy: string = 'id',
  orderedBy: string = 'asc'
) => {
  return useQuery({
    queryKey: ['users', { page, size, sortBy, orderedBy }],
    queryFn: () => usersAPI.list(page, size, sortBy, orderedBy),
    placeholderData: keepPreviousData, // keep the table (and its sort buttons) on screen while the backend sorts
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
