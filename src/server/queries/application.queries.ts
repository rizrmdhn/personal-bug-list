import { applications } from "@/server/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../db";
import { paginate } from "../db/utils";
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

export async function getApplicationList(page: number, limit: number) {
  try {
    const baseQuery = db.select().from(applications).$dynamic();

    const result = await paginate<typeof baseQuery, SelectApplication>(
      baseQuery,
      applications,
      {
        limit,
        page,
        orderBy: asc(applications.createdAt),
      },
    );

    return result;
  } catch (error) {
    // Handle or rethrow the error as needed
    throw new Error(
      `Failed to fetch application list: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
