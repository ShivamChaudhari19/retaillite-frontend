import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { InvoiceStatus, PagedInvoiceResponse, SalePeriod } from '@/shared/types';

const client = apiClient.getClient();

export const SALE_STATUSES: { value: InvoiceStatus; label: string; path: string }[] = [
  { value: 'PAID', label: 'Paid', path: 'paid' },
  { value: 'PENDING', label: 'Pending', path: 'pending' },
  { value: 'CANCELED', label: 'Canceled', path: 'canceled' },
];

export const SALE_PERIODS: { value: SalePeriod; label: string }[] = [
  { value: 'TODAY', label: 'Today' },
  { value: 'WEEKLY', label: 'This week' },
  { value: 'MONTHLY', label: 'This month' },
  { value: 'QUARTERLY', label: 'This quarter' },
  { value: 'YEARLY', label: 'This year' },
];

const statusPath = (status: InvoiceStatus) => SALE_STATUSES.find((s) => s.value === status)!.path;

export const dashboardAPI = {
  // ROLE_USER: GET /dashboard/user/{invoiceStatus}/sale  (the logged-in user's invoices, today)
  userSale: async (status: InvoiceStatus, page: number, size: number) => {
    const { data } = await client.get<PagedInvoiceResponse>(`/dashboard/user/${statusPath(status)}/sale`, {
      params: { page, size, sortBy: 'updatedAt', orderBy: 'desc' },
    });
    return data;
  },

  // ROLE_ADMIN: GET /dashboard/admin/{period}/{invoiceStatus}/sale  (everyone's invoices)
  adminSale: async (period: SalePeriod, status: InvoiceStatus, page: number, size: number) => {
    const { data } = await client.get<PagedInvoiceResponse>(
      `/dashboard/admin/${period.toLowerCase()}/${statusPath(status)}/sale`,
      { params: { page, size, sortBy: 'updatedAt', orderBy: 'desc' } }
    );
    return data;
  },
};

export const useUserSale = (status: InvoiceStatus, page: number, size: number, enabled = true) =>
  useQuery({
    queryKey: ['dashboard', 'user', status, page, size],
    queryFn: () => dashboardAPI.userSale(status, page, size),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useAdminSale = (period: SalePeriod, status: InvoiceStatus, page: number, size: number, enabled = true) =>
  useQuery({
    queryKey: ['dashboard', 'admin', period, status, page, size],
    queryFn: () => dashboardAPI.adminSale(period, status, page, size),
    placeholderData: keepPreviousData,
    enabled,
  });
