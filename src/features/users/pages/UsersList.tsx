import { useState } from 'react';
import { useListUsers, useDeleteUser, useCreateUser } from '@/features/users/api/users';
import { usePagination } from '@/shared/hooks/usePagination';
import { Layout } from '@/shared/components/Layout';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { Pagination } from '@/shared/components/Pagination';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { UserForm } from '@/features/users/components/UserForm';
import { formatDateTime } from '@/shared/utils/format';
import { Trash2, Plus } from 'lucide-react';
import { UserRequest, UserResponse } from '@/shared/types';
import { SortableTh } from '@/shared/components/SortControls';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const UsersList = () => {
  const [showForm, setShowForm] = useState(false);
  const { auth } = useAuth();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const pagination = usePagination(10, 'id', 'asc');
  const { data, isLoading, error, refetch, isFetching } = useListUsers(
    pagination.page,
    pagination.size,
    pagination.sortBy,
    pagination.orderedBy
  );
  const { mutate: createUser, isPending: isCreating, error: createError, reset: resetCreate } = useCreateUser();
  const { mutate: deleteUser, isPending: isDeleting, error: deleteError, reset: resetDelete } = useDeleteUser();

  const handleCreate = (formData: UserRequest) => {
    createUser(formData, {
      onSuccess: () => {
        setShowForm(false);
      },
    });
  };

  const handleDelete = () => {
    if (deleteUserId) {
      deleteUser(deleteUserId, {
        onSuccess: () => {
          setDeleteUserId(null);
        },
      });
    }
  };

  return (
    <Layout title="Users">
      <div className="space-y-lg">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Manage system users and their roles
          </p>
          <button
            onClick={() => {
              resetCreate();
              setShowForm(true);
            }}
            className="button-primary flex items-center gap-sm"
          >
            <Plus className="w-4 h-4" />
            Create User
          </button>
        </div>

        {/* Create Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-lg">
            <div className="bg-card rounded-lg shadow-lg p-2xl">
              <h2 className="text-lg font-semibold mb-lg">Create New User</h2>
              <UserForm
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

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          {isLoading ? (
            <div className="p-2xl text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-lg"></div>
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-lg">
              <ErrorAlert error={error} onRetry={() => refetch()} />
            </div>
          ) : !data?.content.length ? (
            <div className="p-2xl text-center">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <SortableTh field="username" label="Username" sortBy={pagination.sortBy} orderedBy={pagination.orderedBy} onSort={pagination.toggleSort} />
                      <SortableTh field="name" label="Name" sortBy={pagination.sortBy} orderedBy={pagination.orderedBy} onSort={pagination.toggleSort} />
                      <SortableTh field="role" label="Role" sortBy={pagination.sortBy} orderedBy={pagination.orderedBy} onSort={pagination.toggleSort} />
                      <SortableTh field="createdAt" label="Created" sortBy={pagination.sortBy} orderedBy={pagination.orderedBy} onSort={pagination.toggleSort} />
                      <th className="table-cell font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((user: UserResponse) => (
                      <tr key={user.userId} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="table-cell font-medium">{user.username}</td>
                        <td className="table-cell">{user.name}</td>
                        <td className="table-cell">
                          <span className={`badge-status ${
                            user.role.includes('ADMIN') ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-muted-foreground'
                          }`}>
                            {user.role.replace('ROLE_', '')}
                          </span>
                        </td>
                        <td className="table-cell text-sm text-muted-foreground">
                          {formatDateTime(user.createdAt)}
                        </td>
                        <td className="table-cell text-right">
                          {user.username === auth?.username ? (
                            <span className="text-xs text-muted-foreground">You</span>
                          ) : (
                          <button
                            onClick={() => {
                              resetDelete();
                              setDeleteUserId(user.userId);
                            }}
                            className="inline-flex items-center gap-sm text-destructive hover:text-destructive/80 transition-colors text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      {deleteUserId && (
        <ConfirmDialog
          title="Delete User"
          message="This action cannot be undone. The user will be permanently removed from the system."
          confirmText="Delete"
          cancelText="Keep User"
          isDangerous
          isLoading={isDeleting}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setDeleteUserId(null)}
        />
      )}
    </Layout>
  );
};
