import { useEffect } from 'react';
import type { PageMetadata } from '@/shared/types';

interface PaginationProps {
  page: number;
  meta?: PageMetadata;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
}

export const Pagination = ({ page, meta, onPageChange, isFetching = false }: PaginationProps) => {
  const totalPages = meta?.totalPages ?? 0;

  // If the last row of the last page was deleted, step back instead of showing an empty page.
  useEffect(() => {
    if (meta && totalPages > 0 && page >= totalPages) onPageChange(totalPages - 1);
  }, [meta, totalPages, page, onPageChange]);

  return (
    <div className="flex items-center justify-between p-lg border-t border-border">
      <p className="text-sm text-muted-foreground">
        Page {(meta?.number ?? 0) + 1} of {Math.max(totalPages, 1)} • {meta?.totalElements ?? 0} total
        {isFetching && <span className="ml-sm text-xs">Updating…</span>}
      </p>
      <div className="flex gap-sm">
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="button-secondary text-sm"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
          className="button-secondary text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};
