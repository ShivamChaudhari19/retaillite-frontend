import { AlertCircle } from 'lucide-react';
import { ErrorAlert } from '@/shared/components/ErrorAlert';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  /** Failure from the confirm action - shown inside the dialog so it isn't lost. */
  error?: unknown;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-sm mx-4">
        {/* Content */}
        <div className="p-2xl">
          {/* Header */}
          <div className="flex items-start gap-lg mb-lg">
            <div className={`p-md rounded-full ${isDangerous ? 'bg-destructive/10' : 'bg-warning/10'}`}>
              <AlertCircle className={`w-6 h-6 ${isDangerous ? 'text-destructive' : 'text-warning'}`} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg mb-sm">{title}</h2>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>

          <ErrorAlert error={error} className="mb-lg" />

          {/* Buttons */}
          <div className="flex gap-md justify-end pt-lg border-t border-border">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="button-secondary"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={isDangerous ? 'button-danger' : 'button-primary'}
            >
              {isLoading ? 'Loading...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
