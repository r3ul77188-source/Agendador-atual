import { useMemo, useState } from "react";
import { PAGE_SIZE } from "../lib/constants";

interface UseListControlsOptions<T> {
  items: T[] | undefined;
  /** Predicado de busca textual. */
  search: (item: T, query: string) => boolean;
  /** Comparadores disponíveis, indexados pela chave usada no <select>. */
  sorters: Record<string, (a: T, b: T) => number>;
  initialSort: string;
  pageSize?: number;
}

/**
 * Busca, filtro, ordenação e paginação no cliente.
 * A API atual não expõe paginação/ordenação, então tudo é resolvido em memória.
 */
export function useListControls<T>({
  items,
  search,
  sorters,
  initialSort,
  pageSize = PAGE_SIZE,
}: UseListControlsOptions<T>) {
  const [query, setQueryState] = useState("");
  const [sort, setSortState] = useState(initialSort);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const list = items ?? [];
    const term = query.trim().toLowerCase();
    if (!term) return list;
    return list.filter((item) => search(item, term));
  }, [items, query, search]);

  const sorted = useMemo(() => {
    const comparator = sorters[sort] ?? Object.values(sorters)[0];
    return comparator ? [...filtered].sort(comparator) : filtered;
  }, [filtered, sort, sorters]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  const setQuery = (value: string) => {
    setQueryState(value);
    setPage(1);
  };

  const setSort = (value: string) => {
    setSortState(value);
    setPage(1);
  };

  return {
    query,
    setQuery,
    sort,
    setSort,
    page: currentPage,
    setPage,
    totalPages,
    pageItems,
    filteredCount: sorted.length,
    totalCount: items?.length ?? 0,
    pageSize,
    start,
  };
}
