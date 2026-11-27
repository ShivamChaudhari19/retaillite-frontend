import { useState, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

interface PaginationState {
  page: number;
  size: number;
  sortBy: string;
  orderedBy: SortDirection;
}

/**
 * Pagination + server-side sort state.
 * Sorting never touches the data locally: changing sortBy/orderedBy changes
 * the request params (and the react-query key), so the backend returns the
 * already-sorted page.
 */
export const usePagination = (
  defaultSize: number = 10,
  defaultSortBy: string = 'id',
  defaultOrderedBy: SortDirection = 'asc'
) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: defaultSize,
    sortBy: defaultSortBy,
    orderedBy: defaultOrderedBy,
  });

  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page: Math.max(0, page) }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination((prev) => ({ ...prev, size: Math.min(50, Math.max(1, size)), page: 0 }));
  }, []);

  /** Click on a column: same column flips direction, a new column starts ascending. */
  const toggleSort = useCallback((field: string) => {
    setPagination((prev) => ({
      ...prev,
      sortBy: field,
      orderedBy: prev.sortBy === field && prev.orderedBy === 'asc' ? 'desc' : 'asc',
      page: 0,
    }));
  }, []);

  /** Explicit set (used by the dropdown + direction button on card grids). */
  const setSort = useCallback((sortBy: string, orderedBy: SortDirection) => {
    setPagination((prev) => ({ ...prev, sortBy, orderedBy, page: 0 }));
  }, []);

  return {
    ...pagination,
    goToPage,
    setPageSize,
    toggleSort,
    setSort,
  };
};
