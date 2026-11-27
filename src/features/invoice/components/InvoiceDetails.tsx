import { useState } from 'react';
import { Download, X, Banknote, CreditCard, Undo2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  isRazorpayResponse,
  useDownloadInvoicePdf,
  useInvoice,
  usePayInvoice,
  useRefundInvoice,
  useVerifyPayment,
} from '@/features/invoice/api/invoices';
import { useAllProducts } from '@/features/products/api/products';
import { InvoiceStatusBadge } from '@/features/invoice/components/InvoiceStatusBadge';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { getErrorMessage } from '@/shared/api/errors';
import { openRazorpayCheckout } from '@/shared/utils/razorpay';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';
import { InvoiceResponse, PaymentMethod } from '@/shared/types';

interface InvoiceDetailsProps {
  invoiceId: string;
  initialInvoice?: InvoiceResponse;
  onClose: () => void;
}

export const InvoiceDetails = ({ invoiceId, initialInvoice, onClose }: InvoiceDetailsProps) => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth(); // refunds are admin-only on the backend
  const { data: invoice, error: loadError, refetch } = useInvoice(invoiceId, initialInvoice);
  const { data: products } = useAllProducts();

  const { mutate: pay, isPending: isPaying } = usePayInvoice();
  const { mutate: verify, isPending: isVerifying } = useVerifyPayment();
  const { mutate: refund, isPending: isRefunding, error: refundError, reset: resetRefund } = useRefundInvoice();
  const { mutate: downloadPdf, isPending: isDownloading, error: pdfError } = useDownloadInvoicePdf();

  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmRefund, setConfirmRefund] = useState(false);

  const productName = (productId: string) =>
    products?.find((p) => p.productId === productId)?.name ?? `Product ${productId.slice(0, 8)}`;

  const refreshInvoice = () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  const handlePay = (method: PaymentMethod) => {
    if (!invoice) return;
    setActionError(null);
    setNotice(null);

    pay(
      { invoiceId: invoice.invoiceId, paymentMethod: method },
      {
        onError: (e) => setActionError(getErrorMessage(e, 'Could not start the payment.')),
        onSuccess: async (res) => {
          if (!isRazorpayResponse(res)) {
            setNotice('Cash payment recorded.');
            return;
          }
          try {
            await openRazorpayCheckout({
              keyId: res.gatewayKeyId,
              orderId: res.gatewayOrderId,
              currency: res.currency || 'INR',
              description: `Invoice ${invoice.invoiceId}`,
              prefill: {
                name: invoice.customerName,
                email: invoice.customerEmail,
                contact: invoice.customerNumber,
              },
              onSuccess: (r) =>
                verify(
                  {
                    gatewayOrderId: r.razorpay_order_id,
                    gatewayPaymentId: r.razorpay_payment_id,
                    signature: r.razorpay_signature,
                  },
                  {
                    onSuccess: () => setNotice('Payment verified. Invoice marked as paid.'),
                    onError: (e) => {
                      setActionError(
                        `${getErrorMessage(e, 'Payment verification failed.')} If money was deducted, the invoice will update automatically once Razorpay confirms it.`
                      );
                      refreshInvoice();
                    },
                  }
                ),
              onFailure: (message) => setActionError(message),
              onDismiss: () => setNotice('Checkout closed. The invoice is still pending.'),
            });
          } catch (e) {
            setActionError(getErrorMessage(e, 'Could not open the payment window.'));
          }
        },
      }
    );
  };

  const handleRefund = () => {
    if (!invoice) return;
    refund(
      { invoiceId: invoice.invoiceId },
      {
        onSuccess: () => {
          setConfirmRefund(false);
          setNotice('Refund processed.');
        },
      }
    );
  };

  const busy = isPaying || isVerifying;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-lg">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-3xl max-h-full overflow-y-auto">
        <div className="flex items-start justify-between p-xl border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Invoice</h2>
            <p className="text-xs text-muted-foreground break-all">{invoiceId}</p>
          </div>
          <button onClick={onClose} className="p-xs text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-xl space-y-lg">
          <ErrorAlert error={loadError} onRetry={() => refetch()} />
          <ErrorAlert error={actionError} />
          <ErrorAlert error={pdfError} fallback="Could not download the PDF." />
          {notice && (
            <div role="status" className="p-md bg-success/10 border border-success/20 rounded-md text-sm text-success">
              {notice}
            </div>
          )}

          {invoice && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-md text-sm">
                <Info label="Customer" value={invoice.customerName} />
                <Info label="Mobile" value={invoice.customerNumber} />
                <Info label="Email" value={invoice.customerEmail || '—'} />
                <Info label="Created by" value={invoice.userName || '—'} />
                <Info label="Created" value={formatDateTime(invoice.createdAt)} />
                <Info label="Updated" value={formatDateTime(invoice.updatedAt)} />
                <div>
                  <p className="text-xs text-muted-foreground mb-xs">Status</p>
                  <InvoiceStatusBadge status={invoice.invoiceStatus} />
                </div>
              </div>

              <div className="overflow-x-auto border border-border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="table-cell font-medium text-left">Product</th>
                      <th className="table-cell font-medium text-right">Qty</th>
                      <th className="table-cell font-medium text-right">Unit price</th>
                      <th className="table-cell font-medium text-right">Line total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.invoiceItems.map((item) => (
                      <tr key={item.invoiceItemId} className="border-b border-border last:border-0">
                        <td className="table-cell">{productName(item.productId)}</td>
                        <td className="table-cell text-right">{item.quantity}</td>
                        <td className="table-cell text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="table-cell text-right">{formatCurrency(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ml-auto max-w-xs space-y-xs text-sm">
                <Row label="Subtotal" value={formatCurrency(invoice.subTotal)} />
                <Row label="Tax" value={formatCurrency(invoice.tax)} />
                <Row label="Grand total" value={formatCurrency(invoice.grandTotal)} bold />
              </div>

              <div className="flex flex-wrap gap-md justify-end border-t border-border pt-lg">
                <button
                  onClick={() => downloadPdf(invoice.invoiceId)}
                  disabled={isDownloading}
                  className="button-secondary inline-flex items-center gap-sm"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? 'Preparing…' : 'Download PDF'}
                </button>

                {invoice.invoiceStatus === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handlePay('CASH')}
                      disabled={busy}
                      className="button-secondary inline-flex items-center gap-sm"
                    >
                      <Banknote className="w-4 h-4" />
                      Pay Cash
                    </button>
                    <button
                      onClick={() => handlePay('ONLINE')}
                      disabled={busy}
                      className="button-primary inline-flex items-center gap-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      {busy ? 'Processing…' : 'Pay Online'}
                    </button>
                  </>
                )}

                {isAdmin && invoice.invoiceStatus === 'PAID' && (
                  <button
                    onClick={() => {
                      resetRefund();
                      setConfirmRefund(true);
                    }}
                    className="button-danger inline-flex items-center gap-sm"
                  >
                    <Undo2 className="w-4 h-4" />
                    Refund
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {confirmRefund && (
        <ConfirmDialog
          title="Refund invoice"
          message="The payment for this invoice will be refunded. This cannot be undone."
          confirmText="Refund"
          isDangerous
          isLoading={isRefunding}
          error={refundError}
          onConfirm={handleRefund}
          onCancel={() => setConfirmRefund(false)}
        />
      )}
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-xs">{label}</p>
    <p className="font-medium break-words">{value}</p>
  </div>
);

const Row = ({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) => (
  <div className={`flex justify-between ${bold ? 'font-bold text-base border-t border-border pt-sm' : ''}`}>
    <span className={bold ? '' : 'text-muted-foreground'}>{label}</span>
    <span>{value}</span>
  </div>
);
