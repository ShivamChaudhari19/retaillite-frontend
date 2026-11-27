import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { fetchAllPages } from '@/shared/api/fetchAll';
import {
  ProductResponse,
  PagedProductResponse,
} from '@/shared/types';

const client = apiClient.getClient();

export const productsAPI = {
  list: async (page: number, size: number, sortBy: string, orderedBy: string) => {
    const { data } = await client.get<PagedProductResponse>('/product/products', {
      params: { page, size, sortBy, orderedBy },
    });
    return data;
  },

  create: async (payload: FormData) => {
    // const { data } = await client.post<ProductResponse>('/product', payload, {
    //   headers: { 'Content-Type': 'multipart/form-data' },
    // });
      const { data } = await client.post<ProductResponse>('/product', payload);
    return data;
  },

  delete: async (productId: string) => {
    await client.delete(`/product/${productId}`);
  },
};

export const useListProducts = (
  page: number,
  size: number,
  sortBy: string = 'name',
  orderedBy: string = 'asc'
) => {
  return useQuery({
    queryKey: ['products', { page, size, sortBy, orderedBy }],
    queryFn: () => productsAPI.list(page, size, sortBy, orderedBy),
    placeholderData: keepPreviousData,
  });
};

/** Every product (walks all pages) - for pickers such as the invoice form. */
export const useAllProducts = (enabled = true) =>
  useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => fetchAllPages((page, size) => productsAPI.list(page, size, 'name', 'asc')),
    enabled,
    staleTime: 60_000,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
