import type { PagedModel } from '@/shared/types';

/** Backend caps `size` at 50, so "give me everything" means walking the pages. */
export const BACKEND_MAX_PAGE_SIZE = 50;

export const fetchAllPages = async <T>(
  fetchPage: (page: number, size: number) => Promise<PagedModel<T>>
): Promise<T[]> => {
  const items: T[] = [];
  let page = 0;
  let totalPages = 1;
  while (page < totalPages) {
    const res = await fetchPage(page, BACKEND_MAX_PAGE_SIZE);
    items.push(...res.content);
    totalPages = res.page.totalPages;
    page += 1;
  }
  return items;
};
