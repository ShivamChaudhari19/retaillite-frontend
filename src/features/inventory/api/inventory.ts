import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import {
  InventoryResponse,
  PagedInventoryResponse,
  StockUpdateRequest,
  ThresholdUpdateRequest,
} from '@/shared/types';

const client = apiClient.getClient();

export const inventoryAPI = {
  // Get all stock with pagination
  listAll: async (page: number, size: number, sortBy: string, orderedBy: string) => {
    const { data } = await client.get<PagedInventoryResponse>('/inventory/stock', {
      params: { page, size, sortBy, orderedBy },
    });
    return data;
  },

  // Get single product stock
  getStock: async (productId: string) => {
    const { data } = await client.get<InventoryResponse>(`/inventory/${productId}/stock`);
    return data;
  },

  // Get low stock items (no pagination)
  getLowStock: async () => {
    const { data } = await client.get<InventoryResponse[]>('/inventory/stock/low');
    return data;
  },

  // Add stock to product
  addStock: async (productId: string, payload: StockUpdateRequest) => {
    const { data } = await client.post<InventoryResponse>(
      `/inventory/${productId}/stock/add`,
      payload
    );
    return data;
  },

  // Remove stock from product
  removeStock: async (productId: string, payload: StockUpdateRequest) => {
    const { data } = await client.post<InventoryResponse>(
      `/inventory/${productId}/stock/remove`,
      payload
    );
    return data;
  },

  // Set low stock threshold
  setThreshold: async (productId: string, payload: ThresholdUpdateRequest) => {
    const { data } = await client.patch<InventoryResponse>(
      `/inventory/${productId}/stock/low/threshold`,
      payload
    );
    return data;
  },
};

// Queries
export const useListInventory = (
  page: number,
  size: number,
  sortBy: string = 'availableQuantity',
  orderedBy: string = 'asc'
) => {
  return useQuery({
    queryKey: ['inventory', { page, size, sortBy, orderedBy }],
    queryFn: () => inventoryAPI.listAll(page, size, sortBy, orderedBy),
    placeholderData: keepPreviousData,
  });
};

export const useGetStock = (productId: string) => {
  return useQuery({
    queryKey: ['inventory', productId],
    queryFn: () => inventoryAPI.getStock(productId),
  });
};

export const useLowStock = () => {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => inventoryAPI.getLowStock(),
  });
};

// Mutations
export const useAddStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: StockUpdateRequest }) =>
      inventoryAPI.addStock(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useRemoveStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: StockUpdateRequest }) =>
      inventoryAPI.removeStock(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useSetThreshold = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: ThresholdUpdateRequest }) =>
      inventoryAPI.setThreshold(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
