import { applications } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  type CursorPaginationInput,
  type CursorPaginationResult,
  paginate,
  paginateWithCursor,
  type PaginationOptions,
  type SortableColumn,
} from "../db/utils";
import { type SelectApplication } from "@/types/applications.types";

export async function getApplicationBySecret(secret: string) {
  const app = await db.query.applications.findFirst({
    where: eq(applications.secret, secret),
  });

  return app;
}

export async function getApplicationByKeyAndName(key: string, name: string) {
  const app = await db.query.applications.findFirst({
    where: and(eq(applications.key, key), eq(applications.name, name)),
  });

  return app;
}

export async function getCursorBasedApplicationList(
  options: CursorPaginationInput,
): Promise<CursorPaginationResult<SelectApplication>> {
  try {
    const baseQuery = db.select().from(applications).$dynamic();

    return await paginateWithCursor<
      typeof baseQuery,
      SelectApplication,
      "createdAt"
    >(baseQuery, applications.createdAt, options);
  } catch (error) {
    // Handle or rethrow the error as needed
    throw new Error(
      `Failed to fetch application list: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function getApplicationList(options: PaginationOptions) {
  try {
    // Create base query without $dynamic()
    const baseQuery = db.select().from(applications).$dynamic();

    const sortableColumns: SortableColumn[] = [
      { column: applications.createdAt, name: "createdAt" },
      { column: applications.updatedAt, name: "updatedAt" },
      { column: applications.name, name: "name" },
      { column: applications.key, name: "key" },
      { column: applications.isActive, name: "isActive" },
      // Add other sortable columns as needed
    ];

    return await paginate<typeof baseQuery, SelectApplication>(
      baseQuery,
      applications,
      sortableColumns,
      options,
    );
  } catch (error) {
    console.error("Application list fetch error:", error);
    throw new Error(
      `Failed to fetch application list: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
