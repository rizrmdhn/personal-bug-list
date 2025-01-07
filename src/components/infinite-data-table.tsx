import { type CursorPaginationResult } from "@/server/db/utils";
import { DataTable } from "./data-table";
import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import React from "react";

interface InfiniteDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  query: UseInfiniteQueryResult<
    {
      pages: CursorPaginationResult<TData>[];
      pageParams: (string | undefined)[];
    },
    unknown
  >;
  pageSize?: number;
}

export function InfiniteDataTable<TData, TValue>({
  columns,
  query,
  pageSize = 10,
}: InfiniteDataTableProps<TData, TValue>) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = query;

  const flattenedData = React.useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  if (error) {
    return <div>An error occurred: {(error as Error).message}</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={flattenedData}
      pageSize={pageSize}
      hasNextPage={Boolean(hasNextPage)}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={() => fetchNextPage()}
    />
  );
}
