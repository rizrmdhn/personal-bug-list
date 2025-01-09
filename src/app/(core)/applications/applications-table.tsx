"use client";
import { api } from "@/trpc/react";
import { columns } from "./column";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { TraditionalDataTable } from "@/components/traditional-data-table";
import { useEffect, useRef, useMemo } from "react";

export function ApplicationsTable() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [sortBy] = useQueryState("sortBy", parseAsString.withDefault("name"));
  const [sortOrder] = useQueryState("sortOrder", {
    defaultValue: "asc",
    parse: (value: string) => value as "asc" | "desc",
    serialize: (value: "asc" | "desc") => value,
  });

  // Query params object memoization
  const queryParams = useMemo(
    () => ({
      page,
      pageSize: limit,
      sortBy,
      orderBy: sortOrder,
    }),
    [page, limit, sortBy, sortOrder],
  );

  // Keep track of the last successful data response
  const lastDataRef = useRef<typeof data | null>(null);

  const { data, isPending } = api.applications.paginate.useQuery(queryParams);

  // Update the last successful data when we get a new response
  useEffect(() => {
    if (data) {
      lastDataRef.current = data;
    }
  }, [data]);

  // Memoize the fallback state
  const defaultPaginationState = useMemo(
    () => ({
      data: [],
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

  // Optional: Memoize columns if they're computationally expensive
  const memoizedColumns = useMemo(() => columns, []);

  return (
    <TraditionalDataTable
      columns={memoizedColumns}
      data={tableData}
      pagination={paginationProps}
      isLoading={isPending}
    />
  );
}
