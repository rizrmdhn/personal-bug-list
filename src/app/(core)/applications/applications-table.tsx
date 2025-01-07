"use client";

import { InfiniteDataTable } from "@/components/infinite-data-table";
import { api } from "@/trpc/react";
import { columns } from "./column";

export function ApplicationsTable() {
  const query = api.applications.list.useInfiniteQuery(
    { limit: 10 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  return <InfiniteDataTable columns={columns} query={query} />;
}
