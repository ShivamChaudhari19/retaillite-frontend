import { AlertCircle, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '@/shared/api/errors';

interface ErrorAlertProps {
  /** Any thrown value (AxiosError, Error, string...). Nothing is rendered when falsy. */
  error: unknown;
  fallback?: string;
  onRetry?: () => void;
  className?: string;
}

/** One consistent place that shows the backend's error message. */
export const ErrorAlert = ({ error, fallback, onRetry, className = '' }: ErrorAlertProps) => {
  if (!error) return null;
  const message = typeof error === 'string' ? error : getErrorMessage(error, fallback);

  return (
    <div
      role="alert"
      className={`p-md bg-destructive/10 border border-destructive/20 rounded-md flex gap-md items-start ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
      <div className="text-sm text-destructive flex-1 break-words">{message}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-xs text-sm font-medium text-destructive hover:underline"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  );
};
