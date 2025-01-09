"use client";
import { api } from "@/trpc/react";
import { columns } from "./column";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { TraditionalDataTable } from "@/components/traditional-data-table";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { useMemo } from "react";

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

  const { data, isPending } = api.applications.paginate.useQuery(queryParams);

  const { tableData, paginationProps } = useTablePagination({
    data,
    isPending,
    page,
    limit,
  });

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
