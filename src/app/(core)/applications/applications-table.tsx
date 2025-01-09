"use client";
import { api } from "@/trpc/react";
import { columns } from "./column";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { TraditionalDataTable } from "@/components/traditional-data-table";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export function ApplicationsTable() {
  const [query] = useQueryState("query", parseAsString.withDefault(""));
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [sortBy] = useQueryState("sortBy", parseAsString.withDefault("name"));
  const [sortOrder] = useQueryState("sortOrder", {
    defaultValue: "asc",
    parse: (value: string) => value as "asc" | "desc",
    serialize: (value: "asc" | "desc") => value,
  });
  const [simpleSearch] = useQueryState("simpleSearch", {
    defaultValue: false,
    parse: (value: string) => value === "true",
    serialize: (value: boolean) => (value ? "true" : "false"),
  });

  const debouncedQuery = useDebounce(query, 500);

  // Query params object memoization
  const queryParams = useMemo(
    () => ({
      query: debouncedQuery,
      page,
      pageSize: limit,
      sortBy,
      orderBy: sortOrder,
      simpleSearch,
    }),
    [debouncedQuery, page, limit, sortBy, sortOrder, simpleSearch],
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
