// hooks/useTablePagination.ts
import { useEffect, useRef, useMemo } from "react";

interface PaginationData<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  total: number;
  pages: (number | "...")[];
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseTablePaginationProps<T> {
  data: PaginationData<T> | undefined;
  isPending: boolean;
  page: number;
  limit: number;
}

interface UseTablePaginationReturn<T> {
  tableData: T[];
  paginationProps: Omit<PaginationData<T>, "data">;
}

export function useTablePagination<T>({
  data,
  isPending,
  page,
  limit,
}: UseTablePaginationProps<T>): UseTablePaginationReturn<T> {
  // Keep track of the last successful data response
  const lastDataRef = useRef<PaginationData<T> | null>(null);

  // Update the last successful data when we get a new response
  useEffect(() => {
    if (data) {
      lastDataRef.current = data;
    }
  }, [data]);

  // Memoize the fallback state
  const defaultPaginationState = useMemo(
    () => ({
      data: [] as T[],
      currentPage: page,
      totalPages: Math.max(1, lastDataRef.current?.totalPages ?? 1),
      total: lastDataRef.current?.total ?? 0,
      pages: lastDataRef.current?.pages ?? [1],
      limit,
      hasNextPage: lastDataRef.current?.hasNextPage ?? false,
      hasPrevPage: lastDataRef.current?.hasPrevPage ?? false,
    }),
    [page, limit],
  );

  // Memoize the current pagination state
  const paginationState = useMemo(() => {
    if (isPending && lastDataRef.current) {
      return {
        ...lastDataRef.current,
        data: [], // Clear data during loading while keeping pagination state
      };
    }
    return data ?? defaultPaginationState;
  }, [isPending, data, defaultPaginationState]);

  // Memoize the table data
  const tableData = useMemo(
    () => (isPending ? [] : paginationState.data),
    [isPending, paginationState.data],
  );

  // Memoize the pagination props
  const paginationProps = useMemo(
    () => ({
      currentPage: paginationState.currentPage,
      totalPages: paginationState.totalPages,
      total: paginationState.total,
      pages: paginationState.pages,
      limit: paginationState.limit,
      hasNextPage: paginationState.hasNextPage,
      hasPrevPage: paginationState.hasPrevPage,
    }),
    [paginationState],
  );

  return {
    tableData,
    paginationProps,
  };
}
