"use client";

import { api } from "@/trpc/react";
import { columns } from "./column";
import { TraditionalDataTable } from "@/components/traditional-data-table";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import usePaginateParams from "@/hooks/use-paginate-params";

export function ApplicationsTable() {
  const { query, page, sortOrder, pageSize, sortBy, simpleSearch } =
    usePaginateParams({});

  const debouncedQuery = useDebounce(query, 500);

  // Query params object memoization
  const queryParams = useMemo(
    () => ({
      query: debouncedQuery,
      page,
      pageSize,
      sortBy,
      orderBy: sortOrder,
      simpleSearch,
    }),
    [debouncedQuery, page, pageSize, sortBy, sortOrder, simpleSearch],
  );

  const { data, isPending } = api.applications.paginate.useQuery(queryParams);

  const { tableData, paginationProps } = useTablePagination({
    data,
    isPending,
    page,
    limit: pageSize,
  });

  // Optional: Memoize columns if they're computationally expensive
  const memoizedColumns = useMemo(() => columns, []);

  return (
    <TraditionalDataTable
      columns={memoizedColumns}
      data={tableData}
      pagination={paginationProps}
      isLoading={isPending}
      button={{
        title: "Create Application",
        href: "/applications/create",
      }}
    />
  );
}
