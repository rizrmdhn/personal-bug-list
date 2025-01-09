import React from "react";
import { ApplicationsTable } from "./applications-table";
import { HydrateClient } from "@/trpc/server";

export default async function Page() {
  return (
    <HydrateClient>
      <ApplicationsTable />
    </HydrateClient>
  );
}
