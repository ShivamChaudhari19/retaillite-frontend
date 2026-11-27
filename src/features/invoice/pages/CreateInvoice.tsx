import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '@/shared/components/Layout';
import { InvoiceForm } from '@/features/invoice/components/InvoiceForm';
import { useCreateInvoice } from '@/features/invoice/api/invoices';
import { InvoiceRequest } from '@/shared/types';

export const CreateInvoice = () => {
  const navigate = useNavigate();
  const { mutate: createInvoice, isPending, error } = useCreateInvoice();

  const handleCreate = (payload: InvoiceRequest) => {
    createInvoice(payload, {
      // Land on the list with the new invoice already open so it can be paid straight away.
      onSuccess: (invoice) => navigate('/invoices', { state: { openInvoice: invoice } }),
    });
  };

  return (
    <Layout title="Create Invoice">
      <div className="space-y-lg">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-xs text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to invoices
        </Link>
        <div className="card-elevated p-2xl max-w-3xl">
          <InvoiceForm
            onSubmit={handleCreate}
            isLoading={isPending}
            error={error}
            onCancel={() => navigate('/invoices')}
          />
        </div>
      </div>
    </Layout>
  );
};
