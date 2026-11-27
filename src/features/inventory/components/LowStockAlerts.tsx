import { useLowStock } from '@/features/inventory/api/inventory';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InventoryResponse } from '@/shared/types';
import { ErrorAlert } from '@/shared/components/ErrorAlert';

export const LowStockAlerts = () => {
  const { data: lowStockItems = [], isLoading, error, refetch } = useLowStock();

  if (isLoading) {
    return (
      <div className="card-elevated p-2xl">
        <h3 className="text-lg font-semibold mb-lg flex items-center gap-md">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Low Stock Alerts
        </h3>
        <div className="text-center py-lg">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-md"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-2xl">
      <h3 className="text-lg font-semibold mb-lg flex items-center gap-md">
        <AlertTriangle className="w-5 h-5 text-warning" />
        Low Stock Alerts
        {lowStockItems.length > 0 && (
          <span className="ml-auto badge-warning text-xs">
            {lowStockItems.length} items
          </span>
        )}
      </h3>

      {error ? (
        <ErrorAlert error={error} onRetry={() => refetch()} />
      ) : lowStockItems.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-lg">
          All items are well-stocked ✓
        </p>
      ) : (
        <div className="space-y-md max-h-96 overflow-y-auto">
          {lowStockItems.map((item: InventoryResponse) => (
            <div
              key={item.inventoryId}
              className="p-md bg-warning/5 border border-warning/20 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.productName}</p>
                  <p className="text-xs text-muted-foreground mt-xs">
                    Current: <span className="font-semibold text-warning">{item.availableQuantity}</span> units
                    {' '}(Threshold: {item.lowStockThreshold})
                  </p>
                </div>
                <span className="badge-warning text-xs">Low</span>
              </div>
            </div>
          ))}

          <Link
            to="/inventory"
            className="block text-center text-sm text-primary hover:text-primary/80 font-medium mt-lg pt-lg border-t border-border"
          >
            View All Inventory →
          </Link>
        </div>
      )}
    </div>
  );
};
