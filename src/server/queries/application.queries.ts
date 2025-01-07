import { applications } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  type CursorPaginationInput,
  type CursorPaginationResult,
  paginateWithCursor,
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

export async function getApplicationList(
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
