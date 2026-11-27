import { useState } from 'react';
import { useListCategories, useDeleteCategory, useCreateCategory } from '@/features/categories/api/categories';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePagination } from '@/shared/hooks/usePagination';
import { Layout } from '@/shared/components/Layout';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { Pagination } from '@/shared/components/Pagination';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { CategoryForm } from '@/features/categories/components/CategoryForm';
import { formatDateTime } from '@/shared/utils/format';
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { CategoryResponse } from '@/shared/types';
import { SortBar, SortOption } from '@/shared/components/SortControls';

const SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Date created' },
];

export const CategoriesList = () => {
  // Only admins can create/delete; users get a read-only catalog (the backend enforces the same).
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const pagination = usePagination(20, 'name', 'asc');
  const { data, isLoading, error, refetch, isFetching } = useListCategories(
    pagination.page,
    pagination.size,
    pagination.sortBy,
    pagination.orderedBy
  );
  const { mutate: createCategory, isPending: isCreating, error: createError, reset: resetCreate } = useCreateCategory();
  const { mutate: deleteCategory, isPending: isDeleting, error: deleteError, reset: resetDelete } = useDeleteCategory();

  const handleCreate = (formData: FormData) => {
    createCategory(formData, {
      onSuccess: () => {
        setShowForm(false);
      },
    });
  };

  const handleDelete = () => {
    if (deleteCategoryId) {
      deleteCategory(deleteCategoryId, {
        onSuccess: () => {
          setDeleteCategoryId(null);
        },
      });
    }
  };

  return (
    <Layout title="Categories">
      <div className="space-y-lg">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Manage product categories' : 'Browse categories'}
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
              Create Category
            </button>
          )}
        </div>

        {/* Create Form Modal */}
        {isAdmin && showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-lg">
            <div className="bg-card rounded-lg shadow-lg p-2xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-semibold mb-lg">Create New Category</h2>
              <CategoryForm
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
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          ) : error ? (
            <div className="p-lg">
              <ErrorAlert error={error} onRetry={() => refetch()} />
            </div>
          ) : !data?.content.length ? (
            <div className="card-elevated p-2xl text-center">
              <p className="text-muted-foreground">No categories found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {data.content.map((category: CategoryResponse) => (
                  <div key={category.categoryId} className="card-elevated overflow-hidden hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="w-full h-40 bg-muted/30 flex items-center justify-center overflow-hidden">
                      {category.imgUrl ? (
                        <img
                          src={category.imgUrl}
                          alt={category.name}
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
                      <h3 className="font-semibold mb-sm">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mb-lg line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      {/* Meta */}
                      <p className="text-xs text-muted-foreground mb-lg">
                        Created {formatDateTime(category.createdAt)}
                      </p>

                      {isAdmin && (
                        <>
                          {/* Actions */}
                          <button
                            onClick={() => {
                              resetDelete();
                              setDeleteCategoryId(category.categoryId);
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
      {isAdmin && deleteCategoryId && (
        <ConfirmDialog
          title="Delete Category"
          message="This action cannot be undone. The category will be permanently removed from the system."
          confirmText="Delete"
          cancelText="Keep Category"
          isDangerous
          isLoading={isDeleting}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setDeleteCategoryId(null)}
        />
      )}
    </Layout>
  );
};
