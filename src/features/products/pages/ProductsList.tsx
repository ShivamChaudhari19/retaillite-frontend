import { useState } from 'react';
import { useListProducts, useDeleteProduct, useCreateProduct } from '@/features/products/api/products';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePagination } from '@/shared/hooks/usePagination';
import { Layout } from '@/shared/components/Layout';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { Pagination } from '@/shared/components/Pagination';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ProductForm } from '@/features/products/components/ProductForm';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { ProductResponse } from '@/shared/types';
import { SortBar, SortOption } from '@/shared/components/SortControls';

// `value` must be a property name the backend can sort the Product entity by.
const SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'taxRate', label: 'Tax rate' },
  { value: 'createdAt', label: 'Date added' },
];

export const ProductsList = () => {
  // Only admins can create/delete; users get a read-only catalog (the backend enforces the same).
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const pagination = usePagination(10, 'name', 'asc');
  const { data, isLoading, error, refetch, isFetching } = useListProducts(
    pagination.page,
    pagination.size,
    pagination.sortBy,
    pagination.orderedBy
  );
  const { mutate: createProduct, isPending: isCreating, error: createError, reset: resetCreate } = useCreateProduct();
  const { mutate: deleteProduct, isPending: isDeleting, error: deleteError, reset: resetDelete } = useDeleteProduct();

  const handleCreate = (formData: FormData) => {
    createProduct(formData, {
      onSuccess: () => {
        setShowForm(false);
      },
    });
  };

  const handleDelete = () => {
    if (deleteProductId) {
      deleteProduct(deleteProductId, {
        onSuccess: () => {
          setDeleteProductId(null);
        },
      });
    }
  };

  return (
    <Layout title="Products">
      <div className="space-y-lg">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Manage product catalog' : 'Browse products'}
          </p>
          {isAdmin && (
            <button
              onClick={() => {
                resetCreate();
                setShowForm(true);
              }}
              className="button-primary flex items-center gap-sm"
            >
              <Plus className="w-4 h-4" />
              Create Product
            </button>
          )}
        </div>

        {/* Create Form Modal */}
        {isAdmin && showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-lg">
            <div className="bg-card rounded-lg shadow-lg p-2xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-semibold mb-lg">Create New Product</h2>
              <ProductForm
                onSubmit={handleCreate}
                isLoading={isCreating}
                error={createError}
                onCancel={() => {
                  resetCreate();
                  setShowForm(false);
                }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <SortBar
            options={SORT_OPTIONS}
            sortBy={pagination.sortBy}
            orderedBy={pagination.orderedBy}
            onChange={pagination.setSort}
          />
        </div>

        {/* Grid */}
        <div className="space-y-lg">
          {isLoading ? (
            <div className="card-elevated p-2xl text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-lg"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : error ? (
            <div className="p-lg">
              <ErrorAlert error={error} onRetry={() => refetch()} />
            </div>
          ) : !data?.content.length ? (
            <div className="card-elevated p-2xl text-center">
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {data.content.map((product: ProductResponse) => (
                  <div key={product.productId} className="card-elevated overflow-hidden hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="w-full h-40 bg-muted/30 flex items-center justify-center overflow-hidden">
                      {product.imgUrl ? (
                        <img
                          src={product.imgUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                          <ImageIcon className="w-8 h-8 mb-md" />
                          <p className="text-xs">No image</p>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-lg">
                      <h3 className="font-semibold mb-xs">{product.name}</h3>
                      {product.description && (
                        <p className="text-xs text-muted-foreground mb-md line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Price & Tax */}
                      <div className="flex items-center justify-between mb-md">
                        <div>
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(product.price)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tax: {product.taxRate}%
                          </p>
                        </div>
                      </div>

                      {/* Meta */}
                      <p className="text-xs text-muted-foreground mb-lg">
                        Added {formatDateTime(product.createdAt)}
                      </p>

                      {isAdmin && (
                        <>
                          {/* Actions */}
                          <button
                            onClick={() => {
                              resetDelete();
                              setDeleteProductId(product.productId);
                            }}
                            className="w-full flex items-center justify-center gap-sm text-destructive hover:text-destructive/80 transition-colors text-sm font-medium py-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                page={pagination.page}
                meta={data?.page}
                onPageChange={pagination.goToPage}
                isFetching={isFetching}
              />
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {isAdmin && deleteProductId && (
        <ConfirmDialog
          title="Delete Product"
          message="This action cannot be undone. The product will be permanently removed from the system."
          confirmText="Delete"
          cancelText="Keep Product"
          isDangerous
          isLoading={isDeleting}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setDeleteProductId(null)}
        />
      )}
    </Layout>
  );
};
