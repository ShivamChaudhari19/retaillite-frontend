import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { useAllProducts } from '@/features/products/api/products';
import { formatCurrency } from '@/shared/utils/format';
import { InvoiceRequest, ProductResponse } from '@/shared/types';

const invoiceSchema = z
  .object({
    customerName: z.string().trim().min(1, 'Customer name is required'),
    customerNumber: z.string().regex(/^\d{10}$/, 'Enter a 10-digit mobile number'),
    customerEmail: z.string().trim().email('Enter a valid email').or(z.literal('')).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1, 'Select a product'),
          quantity: z.number({ invalid_type_error: 'Enter a quantity' }).int('Whole numbers only').min(1, 'Min 1'),
        })
      )
      .min(1, 'Add at least one item'),
  })
  .superRefine((val, ctx) => {
    const seen = new Set<string>();
    val.items.forEach((item, i) => {
      if (!item.productId) return;
      if (seen.has(item.productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items', i, 'productId'],
          message: 'Already added - increase its quantity instead',
        });
      }
      seen.add(item.productId);
    });
  });

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  onSubmit: (data: InvoiceRequest) => void;
  isLoading?: boolean;
  error?: unknown;
  onCancel: () => void;
}

export const InvoiceForm = ({ onSubmit, isLoading = false, error, onCancel }: InvoiceFormProps) => {
  const { data: products = [], isLoading: productsLoading, error: productsError, refetch } = useAllProducts();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerName: '',
      customerNumber: '',
      customerEmail: '',
      items: [{ productId: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });

  const productById = new Map<string, ProductResponse>(products.map((p) => [p.productId, p]));

  // Preview only: tax is computed by the server and shown on the saved invoice.
  const subtotalPreview = (watchedItems ?? []).reduce((sum, item) => {
    const product = productById.get(item.productId);
    const qty = Number.isFinite(item.quantity) ? item.quantity : 0;
    return product ? sum + product.price * qty : sum;
  }, 0);

  const submit = (data: InvoiceFormData) => {
    onSubmit({
      customerName: data.customerName.trim(),
      customerNumber: data.customerNumber,
      ...(data.customerEmail ? { customerEmail: data.customerEmail } : {}),
      items: data.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-lg w-full max-w-2xl">
      <ErrorAlert error={error} />
      <ErrorAlert error={productsError} fallback="Could not load products." onRetry={() => refetch()} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div>
          <label className="block text-sm font-medium mb-xs">Customer Name</label>
          <input
            className={`input-field ${errors.customerName ? 'border-destructive' : ''}`}
            placeholder="Customer name"
            disabled={isLoading}
            {...register('customerName')}
          />
          {errors.customerName && <p className="text-xs text-destructive mt-xs">{errors.customerName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-xs">Mobile Number</label>
          <input
            inputMode="numeric"
            maxLength={10}
            className={`input-field ${errors.customerNumber ? 'border-destructive' : ''}`}
            placeholder="10-digit number"
            disabled={isLoading}
            {...register('customerNumber')}
          />
          {errors.customerNumber && <p className="text-xs text-destructive mt-xs">{errors.customerNumber.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-xs">Email (optional)</label>
          <input
            type="email"
            className={`input-field ${errors.customerEmail ? 'border-destructive' : ''}`}
            placeholder="customer@example.com"
            disabled={isLoading}
            {...register('customerEmail')}
          />
          {errors.customerEmail && <p className="text-xs text-destructive mt-xs">{errors.customerEmail.message}</p>}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-sm">
          <h3 className="text-sm font-semibold">Items</h3>
          <button
            type="button"
            onClick={() => append({ productId: '', quantity: 1 })}
            disabled={isLoading}
            className="inline-flex items-center gap-xs text-sm font-medium text-primary hover:text-primary/80"
          >
            <Plus className="w-4 h-4" /> Add item
          </button>
        </div>

        <div className="space-y-sm">
          {fields.map((field, index) => {
            const selected = productById.get(watchedItems?.[index]?.productId ?? '');
            const qty = watchedItems?.[index]?.quantity;
            const itemErrors = errors.items?.[index];
            return (
              <div key={field.id} className="grid grid-cols-12 gap-sm items-start">
                <div className="col-span-7">
                  <select
                    className={`input-field ${itemErrors?.productId ? 'border-destructive' : ''}`}
                    disabled={isLoading || productsLoading}
                    {...register(`items.${index}.productId`)}
                  >
                    <option value="">{productsLoading ? 'Loading products…' : 'Select a product'}</option>
                    {products.map((p) => (
                      <option key={p.productId} value={p.productId}>
                        {p.name} - {formatCurrency(p.price)}
                      </option>
                    ))}
                  </select>
                  {itemErrors?.productId && (
                    <p className="text-xs text-destructive mt-xs">{itemErrors.productId.message}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className={`input-field ${itemErrors?.quantity ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                  {itemErrors?.quantity && <p className="text-xs text-destructive mt-xs">{itemErrors.quantity.message}</p>}
                </div>
                <div className="col-span-2 text-sm text-right pt-sm text-muted-foreground">
                  {selected && Number.isFinite(qty) ? formatCurrency(selected.price * qty) : '—'}
                </div>
                <div className="col-span-1 pt-xs text-right">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={isLoading || fields.length === 1}
                    className="p-xs text-destructive hover:text-destructive/80 disabled:opacity-30"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {typeof errors.items?.message === 'string' && (
          <p className="text-xs text-destructive mt-xs">{errors.items.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-md text-sm">
        <span className="text-muted-foreground">Subtotal (tax added on save)</span>
        <span className="font-semibold">{formatCurrency(subtotalPreview)}</span>
      </div>

      <div className="flex gap-md">
        <button type="submit" disabled={isLoading || productsLoading} className="button-primary flex-1">
          {isLoading ? 'Creating…' : 'Create Invoice'}
        </button>
        <button type="button" onClick={onCancel} disabled={isLoading} className="button-secondary flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
};
