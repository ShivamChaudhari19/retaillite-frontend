import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Eye, Download } from 'lucide-react';
import { Layout } from '@/shared/components/Layout';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { Pagination } from '@/shared/components/Pagination';
import { SortableTh } from '@/shared/components/SortControls';
import { usePagination } from '@/shared/hooks/usePagination';
import {
  useDownloadInvoicePdf,
  useListInvoices,
  useListMyInvoices,
} from '@/features/invoice/api/invoices';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { InvoiceDetails } from '@/features/invoice/components/InvoiceDetails';
import { InvoiceStatusBadge } from '@/features/invoice/components/InvoiceStatusBadge';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';
import { InvoiceResponse, InvoiceStatus } from '@/shared/types';

type StatusFilter = InvoiceStatus | 'ALL';

export const InvoiceList = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  // Set by the Create Invoice page so the new invoice opens right away.
  const [selected, setSelected] = useState<InvoiceResponse | null>(
    () => (location.state as { openInvoice?: InvoiceResponse } | null)?.openInvoice ?? null
  );
  const [status, setStatus] = useState<StatusFilter>('ALL');

  const pagination = usePagination(15, 'invoiceId', 'asc');
  // GET /invoices/status/{status} returns every user's invoices, so only admins get the status filter.
  // Users see their own invoices; their per-status view is on the dashboard.
  const filtered = isAdmin && status !== 'ALL';

  // Admin: all invoices. User: only the ones they created (/invoices/user-invioces).
  const allQuery = useListInvoices(
    pagination.page,
    pagination.size,
    pagination.sortBy,
    pagination.orderedBy,
    filtered ? (status as InvoiceStatus) : undefined,
    isAdmin
  );
  const myQuery = useListMyInvoices(
    pagination.page,
    pagination.size,
    pagination.sortBy,
    pagination.orderedBy,
    !isAdmin
  );
  const { data, isLoading, error, refetch, isFetching } = isAdmin ? allQuery : myQuery;

  const { mutate: downloadPdf, variables: downloadingId, isPending: isDownloading, error: pdfError } =
    useDownloadInvoicePdf();

  const sortProps = {
    sortBy: pagination.sortBy,
    orderedBy: pagination.orderedBy,
    onSort: pagination.toggleSort,
    // GET /invoices/status/{status} has no sort parameters
    disabled: filtered,
  };

  return (
    <Layout title="Invoices">
      <div className="space-y-lg">
        <div className="flex flex-wrap justify-between items-center gap-md">
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'All invoices, payments and PDFs' : 'Invoices you created'}
          </p>
          <div className="flex items-center gap-md">
            {isAdmin && (
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as StatusFilter);
                pagination.goToPage(0);
              }}
              className="input-field w-auto"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="CANCELED">Canceled</option>
            </select>
            )}
            <Link to="/invoices/new" className="button-primary flex items-center gap-sm">
              <Plus className="w-4 h-4" />
              Create Invoice
            </Link>
          </div>
        </div>

        {filtered && (
          <p className="text-xs text-muted-foreground">
            Sorting is available when viewing all statuses.
          </p>
        )}

        <ErrorAlert error={pdfError} fallback="Could not download the PDF." />

        <div className="card-elevated overflow-hidden">
          {isLoading ? (
            <div className="p-2xl text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-lg"></div>
              <p className="text-muted-foreground">Loading invoices...</p>
            </div>
          ) : error ? (
            <div className="p-lg">
              <ErrorAlert error={error} onRetry={() => refetch()} />
            </div>
          ) : !data?.content.length ? (
            <div className="p-2xl text-center">
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <SortableTh field="invoiceId" label="Invoice" {...sortProps} />
                      <SortableTh field="customerName" label="Customer" {...sortProps} />
                      <SortableTh field="grandTotal" label="Total" align="right" {...sortProps} />
                      <SortableTh field="invoiceStatus" label="Status" {...sortProps} />
                      <SortableTh field="createdAt" label="Created" {...sortProps} />
                      <th className="table-cell font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((invoice: InvoiceResponse) => (
                      <tr key={invoice.invoiceId} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="table-cell font-medium">{invoice.invoiceId.slice(0, 8)}…</td>
                        <td className="table-cell">
                          <div>{invoice.customerName}</div>
                          <div className="text-xs text-muted-foreground">{invoice.customerNumber}</div>
                        </td>
                        <td className="table-cell text-right font-medium">{formatCurrency(invoice.grandTotal)}</td>
                        <td className="table-cell">
                          <InvoiceStatusBadge status={invoice.invoiceStatus} />
                        </td>
                        <td className="table-cell text-sm text-muted-foreground">{formatDateTime(invoice.createdAt)}</td>
                        <td className="table-cell text-right">
                          <div className="inline-flex gap-md">
                            <button
                              onClick={() => setSelected(invoice)}
                              className="inline-flex items-center gap-xs text-primary hover:text-primary/80 text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" /> View
                            </button>
                            <button
                              onClick={() => downloadPdf(invoice.invoiceId)}
                              disabled={isDownloading && downloadingId === invoice.invoiceId}
                              className="inline-flex items-center gap-xs text-muted-foreground hover:text-foreground text-sm font-medium disabled:opacity-50"
                            >
                              <Download className="w-4 h-4" /> PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={pagination.page}
                meta={data.page}
                onPageChange={pagination.goToPage}
                isFetching={isFetching}
              />
            </>
          )}
        </div>
      </div>

      {selected && (
        <InvoiceDetails
          invoiceId={selected.invoiceId}
          initialInvoice={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </Layout>
  );
};
