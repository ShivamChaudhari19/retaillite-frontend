import { useState } from 'react';
import { TrendingUp, Package, FileText, AlertTriangle } from 'lucide-react';
import { SALE_PERIODS, useAdminSale } from '@/features/dashboard/api/dashboard';
import { SaleReportPanel, countLabel } from '@/features/dashboard/components/SaleReportPanel';
import { KPICard } from '@/features/dashboard/components/KPICard';
import { useListInvoices } from '@/features/invoice/api/invoices';
import { useListProducts } from '@/features/products/api/products';
import { useLowStock } from '@/features/inventory/api/inventory';
import { LowStockAlerts } from '@/features/inventory/components/LowStockAlerts';
import { InvoiceStatus, SalePeriod } from '@/shared/types';

const PAGE_SIZE = 10;

/** ROLE_ADMIN: company-wide sales by period + status (GET /dashboard/admin/{period}/{status}/sale). */
export const AdminDashboard = () => {
  const [period, setPeriod] = useState<SalePeriod>('TODAY');
  const [status, setStatus] = useState<InvoiceStatus>('PAID');
  const [page, setPage] = useState(0);

  const report = useAdminSale(period, status, page, PAGE_SIZE);

  const paid = useAdminSale(period, 'PAID', 0, 1);
  const pending = useAdminSale(period, 'PENDING', 0, 1);
  const canceled = useAdminSale(period, 'CANCELED', 0, 1);

  const counts: Record<InvoiceStatus, string> = {
    PAID: countLabel(paid),
    PENDING: countLabel(pending),
    CANCELED: countLabel(canceled),
  };

  // Overall totals; only the count is needed, so ask for a single row.
  const invoices = useListInvoices(0, 1, 'invoiceId', 'asc');
  const pendingAll = useListInvoices(0, 1, 'invoiceId', 'asc', 'PENDING');
  const products = useListProducts(0, 1);
  const lowStock = useLowStock();

  const periodLabel = SALE_PERIODS.find((p) => p.value === period)?.label.toLowerCase() ?? '';

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-lg">
        <KPICard icon={FileText} label="Invoices" value={countLabel(invoices)} change="Total created" />
        <KPICard icon={TrendingUp} label="Pending Invoices" value={countLabel(pendingAll)} change="Awaiting payment" />
        <KPICard icon={Package} label="Products" value={countLabel(products)} change="In catalog" />
        <KPICard
          icon={AlertTriangle}
          label="Low Stock"
          value={lowStock.isLoading ? '…' : lowStock.isError ? '—' : String(lowStock.data?.length ?? 0)}
          change="Need restocking"
        />
      </div>

      <div className="space-y-md">
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div>
            <h3 className="text-lg font-semibold">Sales report</h3>
            <p className="text-sm text-muted-foreground">Invoices from all users, {periodLabel}.</p>
          </div>
          <select
            aria-label="Report period"
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value as SalePeriod);
              setPage(0);
            }}
            className="input-field w-auto"
          >
            {SALE_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <SaleReportPanel
          status={status}
          onStatusChange={(s) => {
            setStatus(s);
            setPage(0);
          }}
          counts={counts}
          data={report.data}
          isLoading={report.isLoading}
          isFetching={report.isFetching}
          error={report.error}
          onRetry={() => report.refetch()}
          page={page}
          onPageChange={setPage}
          showCreatedBy
          emptyText={`No ${status.toLowerCase()} invoices ${periodLabel}`}
        />
      </div>

      <LowStockAlerts />
    </>
  );
};
