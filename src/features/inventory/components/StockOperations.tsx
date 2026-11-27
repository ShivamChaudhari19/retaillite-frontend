import { useState, FormEvent } from 'react';
import { ErrorAlert } from '@/shared/components/ErrorAlert';

interface StockOperationProps {
  title: string;
  buttonLabel: string;
  onSubmit: (quantity: number) => void;
  isLoading?: boolean;
  error?: Error | null;
  onCancel: () => void;
  maxQuantity?: number;
}

export const StockOperation = ({
  title,
  buttonLabel,
  onSubmit,
  isLoading = false,
  error,
  onCancel,
  maxQuantity,
}: StockOperationProps) => {
  const [quantity, setQuantity] = useState(1);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (quantity < 1) {
      setLocalError('Quantity must be at least 1');
      return;
    }
    if (maxQuantity !== undefined && quantity > maxQuantity) {
      setLocalError(`Cannot remove more than ${maxQuantity} items`);
      return;
    }
    setLocalError(null);
    onSubmit(quantity);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-lg">
      <div className="bg-card rounded-lg shadow-lg p-2xl max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-lg">{title}</h2>

        <ErrorAlert error={localError ?? error} className="mb-lg" />

        <form onSubmit={handleSubmit} className="space-y-lg">
          <div>
            <label className="block text-sm font-medium mb-xs">Quantity</label>
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              className="input-field"
              disabled={isLoading}
              autoFocus
            />
            {maxQuantity !== undefined && (
              <p className="text-xs text-muted-foreground mt-xs">
                Max available: {maxQuantity} units
              </p>
            )}
          </div>

          <div className="flex gap-md">
            <button
              type="submit"
              disabled={isLoading || quantity < 1}
              className="button-primary flex-1"
            >
              {isLoading ? 'Processing...' : buttonLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="button-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ThresholdDialogProps {
  currentThreshold: number;
  onSubmit: (threshold: number) => void;
  isLoading?: boolean;
  error?: Error | null;
  onCancel: () => void;
}

export const ThresholdDialog = ({
  currentThreshold,
  onSubmit,
  isLoading = false,
  error,
  onCancel,
}: ThresholdDialogProps) => {
  const [threshold, setThreshold] = useState(currentThreshold);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (threshold < 1) {
      setLocalError('Threshold must be at least 1');
      return;
    }
    setLocalError(null);
    onSubmit(threshold);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-lg">
      <div className="bg-card rounded-lg shadow-lg p-2xl max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-lg">Set Low Stock Threshold</h2>

        <ErrorAlert error={localError ?? error} className="mb-lg" />

        <form onSubmit={handleSubmit} className="space-y-lg">
          <div>
            <label className="block text-sm font-medium mb-xs">
              Low Stock Threshold (units)
            </label>
            <input
              type="number"
              min="1"
              value={threshold}
              onChange={(e) => setThreshold(Math.max(1, parseInt(e.target.value) || 0))}
              className="input-field"
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-xs">
              Alert will show when stock drops below this level
            </p>
          </div>

          <div className="flex gap-md">
            <button
              type="submit"
              disabled={isLoading || threshold < 1}
              className="button-primary flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Threshold'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="button-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
