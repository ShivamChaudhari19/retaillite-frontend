import { useState } from 'react';
import { Eye } from 'lucide-react';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { Pagination } from '@/shared/components/Pagination';
import { InvoiceStatusBadge } from '@/features/invoice/components/InvoiceStatusBadge';
import { InvoiceDetails } from '@/features/invoice/components/InvoiceDetails';
import { SALE_STATUSES } from '@/features/dashboard/api/dashboard';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';
import { InvoiceResponse, InvoiceStatus, PagedInvoiceResponse } from '@/shared/types';

interface SaleReportPanelProps {
  status: InvoiceStatus;
  onStatusChange: (status: InvoiceStatus) => void;
  /** Total invoices per status for the current scope (from page.totalElements). */
  counts: Record<InvoiceStatus, string>;
  data?: PagedInvoiceResponse;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
  page: number;
  onPageChange: (page: number) => void;
  /** Admin view also shows who created each invoice. */
  showCreatedBy?: boolean;
  emptyText: string;
}

export const SaleReportPanel = ({
  status,
  onStatusChange,
  counts,
  data,
  isLoading,
  isFetching,
  error,
  onRetry,
  page,
  onPageChange,
  showCreatedBy = false,
  emptyText,
}: SaleReportPanelProps) => {
  const [selected, setSelected] = useState<InvoiceResponse | null>(null);

  // The backend pages the report, so this is the total of the rows on screen, not of the whole period.
  const pageTotal = (data?.content ?? []).reduce((sum, i) => sum + i.grandTotal, 0);

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-md border-b border-border p-lg">
        <div role="tablist" aria-label="Invoice status" className="inline-flex rounded-md border border-border overflow-hidden">
          {SALE_STATUSES.map((s) => (
            <button
              key={s.value}
              role="tab"
              aria-selected={status === s.value}
              onClick={() => onStatusChange(s.value)}
              className={`px-lg py-sm text-sm font-medium transition-colors ${
                status === s.value ? 'bg-primary text-white' : 'hover:bg-muted/40'
              }`}
            >
              {s.label} <span className="opacity-70">({counts[s.value]})</span>
            </button>
          ))}
        </div>
        {data && data.content.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Total on this page: <span className="font-semibold text-foreground">{formatCurrency(pageTotal)}</span>
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="p-2xl text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-lg"></div>
          <p className="text-muted-foreground">Loading sales...</p>
        </div>
      ) : error ? (
        <div className="p-lg">
          <ErrorAlert error={error} onRetry={onRetry} />
        </div>
      ) : !data?.content.length ? (
        <div className="p-2xl text-center">
          <p className="text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-cell font-medium text-left">Invoice</th>
                  <th className="table-cell font-medium text-left">Customer</th>
                  {showCreatedBy && <th className="table-cell font-medium text-left">Created by</th>}
                  <th className="table-cell font-medium text-right">Total</th>
                  <th className="table-cell font-medium text-left">Status</th>
                  <th className="table-cell font-medium text-left">Created</th>
                  <th className="table-cell font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((invoice) => (
                  <tr key={invoice.invoiceId} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="table-cell font-medium">{invoice.invoiceId.slice(0, 8)}…</td>
                    <td className="table-cell">
                      <div>{invoice.customerName}</div>
                      <div className="text-xs text-muted-foreground">{invoice.customerNumber}</div>
                    </td>
                    {showCreatedBy && <td className="table-cell text-sm">{invoice.userName || '—'}</td>}
                    <td className="table-cell text-right font-medium">{formatCurrency(invoice.grandTotal)}</td>
                    <td className="table-cell">
                      <InvoiceStatusBadge status={invoice.invoiceStatus} />
                    </td>
                    <td className="table-cell text-sm text-muted-foreground">{formatDateTime(invoice.createdAt)}</td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => setSelected(invoice)}
                        className="inline-flex items-center gap-xs text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} meta={data.page} onPageChange={onPageChange} isFetching={isFetching} />
        </>
      )}

      {selected && (
        <InvoiceDetails invoiceId={selected.invoiceId} initialInvoice={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export const countLabel = (q: {
  isLoading: boolean;
  isError: boolean;
  data?: { page: { totalElements: number } };
}): string => (q.isLoading ? '…' : q.isError ? '—' : String(q.data?.page.totalElements ?? 0));
