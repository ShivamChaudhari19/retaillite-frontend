import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { fetchAllPages } from '@/shared/api/fetchAll';
import {
  CategoryResponse,
  PagedCategoryResponse,
} from '@/shared/types';

const client = apiClient.getClient();

export const categoriesAPI = {
  list: async (page: number, size: number, sortBy: string, orderedBy: string) => {
    const { data } = await client.get<PagedCategoryResponse>('/category/categories', {
      params: { page, size, sortBy, orderedBy },
    });
    return data;
  },

  create: async (payload: FormData) => {
    const { data } = await client.post<CategoryResponse>('/category', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (categoryId: string) => {
    await client.delete(`/category/${categoryId}`);
  },
};

export const useListCategories = (
  page: number,
  size: number,
  sortBy: string = 'name',
  orderedBy: string = 'asc'
) => {
  return useQuery({
    queryKey: ['categories', { page, size, sortBy, orderedBy }],
    queryFn: () => categoriesAPI.list(page, size, sortBy, orderedBy),
    placeholderData: keepPreviousData,
  });
};

/** Every category (walks all pages) - for the product form dropdown. */
export const useAllCategories = () =>
  useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => fetchAllPages((page, size) => categoriesAPI.list(page, size, 'name', 'asc')),
    staleTime: 60_000,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
