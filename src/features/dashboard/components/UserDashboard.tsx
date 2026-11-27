import { useState } from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useUserSale } from '@/features/dashboard/api/dashboard';
import { SaleReportPanel, countLabel } from '@/features/dashboard/components/SaleReportPanel';
import { KPICard } from '@/features/dashboard/components/KPICard';
import { InvoiceStatus } from '@/shared/types';
import { LowStockAlerts } from '@/features/inventory/components/LowStockAlerts';

const PAGE_SIZE = 10;

/** ROLE_USER: today's sales for the invoices this user created (GET /dashboard/user/{status}/sale). */
export const UserDashboard = () => {
  const [status, setStatus] = useState<InvoiceStatus>('PAID');
  const [page, setPage] = useState(0);

  const report = useUserSale(status, page, PAGE_SIZE);

  // One-row requests just to read page.totalElements for each tab / KPI card.
  const paid = useUserSale('PAID', 0, 1);
  const pending = useUserSale('PENDING', 0, 1);
  const canceled = useUserSale('CANCELED', 0, 1);

  const counts: Record<InvoiceStatus, string> = {
    PAID: countLabel(paid),
    PENDING: countLabel(pending),
    CANCELED: countLabel(canceled),
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
        <KPICard icon={CheckCircle2} label="Paid Invoices" value={counts.PAID} change="Created by you today" />
        <KPICard icon={Clock} label="Pending Invoices" value={counts.PENDING} change="Awaiting payment" />
        <KPICard icon={XCircle} label="Canceled Invoices" value={counts.CANCELED} change="Created by you today" />
      </div>

      <div className="space-y-md">
        <div>
          <h3 className="text-lg font-semibold">Your sales today</h3>
          <p className="text-sm text-muted-foreground">Only invoices you created are shown.</p>
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
          emptyText={`No ${status.toLowerCase()} invoices today`}
        />

        <LowStockAlerts/>
      </div>
    </>
  );
};
