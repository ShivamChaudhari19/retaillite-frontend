import { InvoiceStatus } from '@/shared/types';
import { formatStatusLabel } from '@/shared/utils/format';

const STYLES: Record<InvoiceStatus, string> = {
  PENDING: 'badge-warning',
  PAID: 'badge-success',
  CANCELED: 'badge-error',
};

export const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => (
  <span className={STYLES[status] ?? 'badge-pending'}>{formatStatusLabel(status)}</span>
);
