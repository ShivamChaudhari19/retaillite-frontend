import { useState } from 'react';
import {
  useListInventory,
  useLowStock,
  useAddStock,
  useRemoveStock,
  useSetThreshold,
} from '@/features/inventory/api/inventory';
import { usePagination } from '@/shared/hooks/usePagination';
import { Layout } from '@/shared/components/Layout';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { Pagination } from '@/shared/components/Pagination';
import { StockOperation, ThresholdDialog } from '@/features/inventory/components/StockOperations';
import { formatDateTime } from '@/shared/utils/format';
import { Plus, Minus, AlertTriangle, Settings } from 'lucide-react';
import { InventoryResponse } from '@/shared/types';
import { SortableTh } from '@/shared/components/SortControls';

type OperationType = 'add' | 'remove' | null;

interface OperationState {
  type: OperationType;
  productId: string | null;
  productName: string | null;
  currentStock: number | null;
}

interface ThresholdState {
  productId: string | null;
  productName: string | null;
  currentThreshold: number | null;
}

export const InventoryList = () => {
  const [operation, setOperation] = useState<OperationState>({
    type: null,
    productId: null,
    productName: null,
    currentStock: null,
  });

  const [thresholdState, setThresholdState] = useState<ThresholdState>({
    productId: null,
    productName: null,
    currentThreshold: null,
  });

  const pagination = usePagination(15, 'availableQuantity', 'asc');
  const { data, isLoading, error, refetch, isFetching } = useListInventory(
    pagination.page,
    pagination.size,
    pagination.sortBy,
    pagination.orderedBy
  );

  const { data: lowStockItems } = useLowStock();
  const { mutate: addStock, isPending: isAddingStock, error: addError } = useAddStock();
  const { mutate: removeStock, isPending: isRemovingStock, error: removeError } = useRemoveStock();
  const { mutate: setThreshold, isPending: isSettingThreshold, error: thresholdError } =
    useSetThreshold();

  const handleAddStock = (quantity: number) => {
    if (operation.productId) {
      addStock(
        { productId: operation.productId, payload: { quantity } },
        {
          onSuccess: () => {
            setOperation({ type: null, productId: null, productName: null, currentStock: null });
          },
        }
      );
    }
  };

  const handleRemoveStock = (quantity: number) => {
    if (operation.productId) {
      removeStock(
        { productId: operation.productId, payload: { quantity } },
        {
          onSuccess: () => {
            setOperation({ type: null, productId: null, productName: null, currentStock: null });
          },
        }
      );
    }
  };

  const handleSetThreshold = (threshold: number) => {
    if (thresholdState.productId) {
      setThreshold(
        { productId: thresholdState.productId, payload: { threshold } },
        {
          onSuccess: () => {
            setThresholdState({
              productId: null,
              productName: null,
              currentThreshold: null,
            });
          },
        }
      );
    }
  };

  const isLowStock = (inventory: InventoryResponse) =>
    inventory.availableQuantity < inventory.lowStockThreshold;

  return (
    <Layout title="Inventory">
      <div className="space-y-lg">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Manage product stock levels and set low stock alerts
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-lg">
          <SummaryCard
            label="Total Products"
            value={data?.page.totalElements || 0}
            icon="📦"
          />
          <SummaryCard
            label="Low Stock Items"
            value={lowStockItems?.length ?? 0}
            icon="⚠️"
            highlight
          />
          <SummaryCard
            label="Units On This Page"
            value={data?.content.reduce((sum, inv) => sum + inv.availableQuantity, 0) || 0}
            icon="📊"
          />
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          {isLoading ? (
            <div className="p-2xl text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-lg"></div>
              <p className="text-muted-foreground">Loading inventory...</p>
            </div>
          ) : error ? (
            <div className="p-lg">
              <ErrorAlert error={error} onRetry={() => refetch()} />
            </div>
          ) : !data?.content.length ? (
            <div className="p-2xl text-center">
              <p className="text-muted-foreground">No inventory data</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="table-cell font-medium">Product Name</th>
                      <SortableTh field="availableQuantity" label="Current Stock" align="right" sortBy={pagination.sortBy} orderedBy={pagination.orderedBy} onSort={pagination.toggleSort} />
                      <SortableTh field="lowStockThreshold" label="Low Stock Threshold" align="right" sortBy={pagination.sortBy} orderedBy={pagination.orderedBy} onSort={pagination.toggleSort} />
                      <th className="table-cell font-medium">Status</th>
                      <SortableTh field="updatedAt" label="Last Updated" sortBy={pagination.sortBy} orderedBy={pagination.orderedBy} onSort={pagination.toggleSort} />
                      <th className="table-cell font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((inventory: InventoryResponse) => {
                      const lowStock = isLowStock(inventory);
                      return (
                        <tr
                          key={inventory.inventoryId}
                          className={`border-b border-border hover:bg-muted/20 transition-colors ${
                            lowStock ? 'bg-warning/5' : ''
                          }`}
                        >
                          <td className="table-cell font-medium">{inventory.productName}</td>
                          <td className="table-cell text-right">
                            <span
                              className={`font-bold text-lg ${
                                lowStock ? 'text-warning' : 'text-foreground'
                              }`}
                            >
                              {inventory.availableQuantity}
                            </span>
                          </td>
                          <td className="table-cell text-right">
                            <span className="text-muted-foreground">
                              {inventory.lowStockThreshold}
                            </span>
                          </td>
                          <td className="table-cell">
                            {lowStock ? (
                              <span className="badge-warning flex items-center gap-xs w-fit">
                                <AlertTriangle className="w-3 h-3" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="badge-success">In Stock</span>
                            )}
                          </td>
                          <td className="table-cell text-sm text-muted-foreground">
                            {formatDateTime(inventory.updatedAt)}
                          </td>
                          <td className="table-cell">
                            <div className="flex gap-sm">
                              <button
                                onClick={() =>
                                  setOperation({
                                    type: 'add',
                                    productId: inventory.productId,
                                    productName: inventory.productName,
                                    currentStock: inventory.availableQuantity,
                                  })
                                }
                                className="inline-flex items-center gap-xs text-primary hover:text-primary/80 transition-colors text-sm font-medium p-xs"
                                title="Add stock"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setOperation({
                                    type: 'remove',
                                    productId: inventory.productId,
                                    productName: inventory.productName,
                                    currentStock: inventory.availableQuantity,
                                  })
                                }
                                className="inline-flex items-center gap-xs text-destructive hover:text-destructive/80 transition-colors text-sm font-medium p-xs"
                                title="Remove stock"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setThresholdState({
                                    productId: inventory.productId,
                                    productName: inventory.productName,
                                    currentThreshold: inventory.lowStockThreshold,
                                  })
                                }
                                className="inline-flex items-center gap-xs text-muted-foreground hover:text-foreground transition-colors text-sm font-medium p-xs"
                                title="Set threshold"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

      {/* Stock Operation Dialogs */}
      {operation.type === 'add' && (
        <StockOperation
          title={`Add Stock to ${operation.productName}`}
          buttonLabel="Add Stock"
          onSubmit={handleAddStock}
          isLoading={isAddingStock}
          error={addError}
          onCancel={() =>
            setOperation({ type: null, productId: null, productName: null, currentStock: null })
          }
        />
      )}

      {operation.type === 'remove' && (
        <StockOperation
          title={`Remove Stock from ${operation.productName}`}
          buttonLabel="Remove Stock"
          onSubmit={handleRemoveStock}
          isLoading={isRemovingStock}
          error={removeError}
          onCancel={() =>
            setOperation({ type: null, productId: null, productName: null, currentStock: null })
          }
          maxQuantity={operation.currentStock ?? undefined}
        />
      )}

      {/* Threshold Dialog */}
      {thresholdState.productId && (
        <ThresholdDialog
          currentThreshold={thresholdState.currentThreshold || 5}
          onSubmit={handleSetThreshold}
          isLoading={isSettingThreshold}
          error={thresholdError}
          onCancel={() =>
            setThresholdState({
              productId: null,
              productName: null,
              currentThreshold: null,
            })
          }
        />
      )}
    </Layout>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}

const SummaryCard = ({ label, value, icon, highlight = false }: SummaryCardProps) => (
  <div className={`card-elevated p-lg ${highlight ? 'border-warning' : ''}`}>
    <div className="flex items-start justify-between mb-lg">
      <h3 className="font-medium text-sm text-muted-foreground">{label}</h3>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className={`text-3xl font-bold ${highlight ? 'text-warning' : 'text-primary'}`}>
      {value}
    </p>
  </div>
);
