import { useEffect, useMemo, useState } from "react";

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

/**
 * A custom hook for handling table pagination state and data.
 *
 * @template T - The type of data items in the table
 *
 * @param {Object} props - The hook properties
 * @param {PaginationData<T>} props.data - The current pagination data
 * @param {boolean} props.isPending - Whether data is currently being loaded
 * @param {number} props.page - The current page number
 * @param {number} props.limit - The number of items per page
 *
 * @returns {Object} An object containing:
 *   - tableData: The current page's data items
 *   - paginationProps: An object containing pagination state:
 *     - currentPage: The current page number
 *     - totalPages: Total number of pages
 *     - total: Total number of items
 *     - pages: Array of available page numbers
 *     - limit: Number of items per page
 *     - hasNextPage: Whether there is a next page
 *     - hasPrevPage: Whether there is a previous page
 *
 * @remarks
 * This hook maintains the last successful data response to provide a smooth loading state
 * and fallback values when new data is being fetched. During loading states, it preserves
 * pagination information while clearing the data array.
 */
export function useTablePagination<T>({
  data,
  isPending,
  page,
  limit,
}: UseTablePaginationProps<T>): UseTablePaginationReturn<T> {
  // Keep track of the last successful data response
  const [lastData, setLastData] = useState<PaginationData<T> | null>(null);

  // Update the last successful data when we get a new response
  useEffect(() => {
    if (data) {
      setLastData(data);
    }
  }, [data]);

  // Memoize the fallback state
  const defaultPaginationState = useMemo(
    () => ({
      data: [] as T[],
      currentPage: page,
      totalPages: Math.max(1, lastData?.totalPages ?? 1),
      total: lastData?.total ?? 0,
      pages: lastData?.pages ?? [1],
      limit,
      hasNextPage: lastData?.hasNextPage ?? false,
      hasPrevPage: lastData?.hasPrevPage ?? false,
    }),
    [
      page,
      lastData?.totalPages,
      lastData?.total,
      lastData?.pages,
      lastData?.hasNextPage,
      lastData?.hasPrevPage,
      limit,
    ],
  );

  // Memoize the current pagination state
  const paginationState = useMemo(() => {
    if (isPending && lastData) {
      return {
        ...lastData,
        data: [], // Clear data during loading while keeping pagination state
      };
    }
    return data ?? defaultPaginationState;
  }, [isPending, lastData, data, defaultPaginationState]);

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
