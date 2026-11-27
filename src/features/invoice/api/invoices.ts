import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { unwrapBlobError } from '@/shared/api/errors';
import {
  InvoiceRequest,
  InvoiceResponse,
  InvoiceStatus,
  PagedInvoiceResponse,
  PaymentRequest,
  PaymentResponseUnion,
  PaymentVerifyRequest,
  RazorpayPaymentResponse,
  RefundRequest,
  RefundResponse,
} from '@/shared/types';

const client = apiClient.getClient();

/** Invoice changes (create/pay/verify/refund) also change the dashboard sale reports. */
const invalidateInvoiceData = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['invoices'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
};

export const invoicesAPI = {
  // Sorted by the backend: GET /invoices?page&size&sortBy&orderedBy
  list: async (page: number, size: number, sortBy: string, orderedBy: string) => {
    const { data } = await client.get<PagedInvoiceResponse>('/invoices', {
      params: { page, size, sortBy, orderedBy },
    });
    return data;
  },

  // GET /invoices/status/{status}?page&size  (the API has no sort params here)
  listByStatus: async (status: InvoiceStatus, page: number, size: number) => {
    const { data } = await client.get<PagedInvoiceResponse>(`/invoices/status/${status}`, {
      params: { page, size },
    });
    return data;
  },

  // GET /invoices/user-invioces - only the logged-in user's own invoices (the path is spelled this way on the backend)
  listMine: async (page: number, size: number, sortBy: string, orderedBy: string) => {
    const { data } = await client.get<PagedInvoiceResponse>('/invoices/user-invioces', {
      params: { page, size, sortBy, orderedBy },
    });
    return data;
  },

  get: async (invoiceId: string) => {
    const { data } = await client.get<InvoiceResponse>(`/invoices/${invoiceId}`);
    return data;
  },

  create: async (payload: InvoiceRequest) => {
    const { data } = await client.post<InvoiceResponse>('/invoices/invoice', payload);
    return data;
  },

  downloadPdf: async (invoiceId: string): Promise<Blob> => {
    try {
      const { data } = await client.get<Blob>(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
      return data;
    } catch (e) {
      throw await unwrapBlobError(e);
    }
  },

  pay: async (payload: PaymentRequest) => {
    const { data } = await client.post<PaymentResponseUnion>('/payment/pay', payload);
    return data;
  },

  verify: async (payload: PaymentVerifyRequest) => {
    const { data } = await client.post<PaymentResponseUnion>('/payment/verify', payload);
    return data;
  },

  refund: async (payload: RefundRequest) => {
    const { data } = await client.post<RefundResponse>('/payment/refund', payload);
    return data;
  },
};

/** Narrow the pay/verify union: only the Razorpay variant carries gateway fields. */
export const isRazorpayResponse = (r: PaymentResponseUnion): r is RazorpayPaymentResponse =>
  'gatewayOrderId' in r && !!r.gatewayOrderId;

export const useListInvoices = (
  page: number,
  size: number,
  sortBy: string,
  orderedBy: string,
  status?: InvoiceStatus,
  enabled = true
) =>
  useQuery({
    queryKey: ['invoices', { page, size, status: status ?? 'ALL', ...(status ? {} : { sortBy, orderedBy }) }],
    queryFn: () =>
      status
        ? invoicesAPI.listByStatus(status, page, size)
        : invoicesAPI.list(page, size, sortBy, orderedBy),
    placeholderData: keepPreviousData,
    enabled,
  });

/** Invoices created by the logged-in user (what a ROLE_USER sees on the Invoices page). */
export const useListMyInvoices = (page: number, size: number, sortBy: string, orderedBy: string, enabled = true) =>
  useQuery({
    queryKey: ['invoices', 'mine', { page, size, sortBy, orderedBy }],
    queryFn: () => invoicesAPI.listMine(page, size, sortBy, orderedBy),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoicesAPI.create,
    onSuccess: () => invalidateInvoiceData(queryClient),
  });
};

export const usePayInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoicesAPI.pay,
    // Cash payments complete immediately; online ones are finished by verify/webhook (invalidated there too).
    onSuccess: () => invalidateInvoiceData(queryClient),
  });
};

/** Detail view; seeded from the list row so the modal opens instantly, then kept fresh. */
export const useInvoice = (invoiceId: string | null, initialData?: InvoiceResponse) =>
  useQuery({
    queryKey: ['invoices', 'detail', invoiceId],
    queryFn: () => invoicesAPI.get(invoiceId as string),
    enabled: !!invoiceId,
    initialData,
  });

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoicesAPI.verify,
    onSuccess: () => invalidateInvoiceData(queryClient),
  });
};

export const useRefundInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoicesAPI.refund,
    onSuccess: () => invalidateInvoiceData(queryClient),
  });
};

export const useDownloadInvoicePdf = () =>
  useMutation({
    mutationFn: async (invoiceId: string) => {
      const blob = await invoicesAPI.downloadPdf(invoiceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });
