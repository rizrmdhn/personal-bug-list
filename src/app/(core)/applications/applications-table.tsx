"use client";

import { api } from "@/trpc/react";
import { columns } from "./column";
import { parseAsInteger, useQueryState } from "nuqs";
import { TraditionalDataTable } from "@/components/traditional-data-table";

export function ApplicationsTable() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));

  const { data, isLoading } = api.applications.paginate.useQuery({
    page,
    pageSize: limit,
  });

  if (!data) {
    return null;
  }

  return (
    <TraditionalDataTable
      columns={columns}
      data={data.data}
      pagination={{
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total,
        pages: data.pages,
        limit: data.limit,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage,
      }}
      isLoading={isLoading}
    />
  );
}
