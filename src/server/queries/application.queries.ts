import { applications } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { db, type DBType } from "../db";
import {
  type CursorPaginationInput,
  type CursorPaginationResult,
  paginate,
  paginateWithCursor,
  type PaginationOptions,
  type SortableColumn,
} from "../db/utils";
import { type SelectApplication } from "@/types/applications.types";
import { type z } from "zod";
import { type createApplicationSchema } from "@/schema/application.schema";
import generateApplicationCredentials from "@/lib/generate-credentials";
import { hash } from "@node-rs/argon2";

export async function getApplicationById(id: string) {
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, id),
  });

  return app;
}

export async function getApplicationByKeyAndName(key: string, name: string) {
  const app = await db.query.applications.findFirst({
    where: and(eq(applications.key, key), eq(applications.name, name)),
  });

  return app;
}

export async function getApplicationByKey(key: string) {
  const app = await db.query.applications.findFirst({
    where: eq(applications.key, key),
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

    const opts: PaginationOptions = {
      ...options,
      searchColumns: [applications.name],
    };

    return await paginate<typeof baseQuery, SelectApplication>(
      baseQuery,
      applications,
      sortableColumns,
      opts,
    );
  } catch (error) {
    console.error("Application list fetch error:", error);
    throw new Error(
      `Failed to fetch application list: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function createApplication(
  db: DBType,
  input: z.infer<typeof createApplicationSchema>,
) {
  try {
    const key = generateApplicationCredentials();

    const [app] = await db
      .insert(applications)
      .values({
        name: input.name,
        key: key.appKey,
        secret: await hash(key.appSecret),
      })
      .returning()
      .execute();

    if (!app) {
      throw new Error("Failed to create application");
    }

    return {
      ...app,
      secret: key.appSecret,
    };
  } catch (error) {
    throw new Error(
      `Failed to create application: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function revokeApplication(id: string) {
  try {
    const app = await getApplicationById(id);

    if (!app) {
      throw new Error("Application not found");
    }

    const result = await db.transaction(async (tx) => {
      await tx
        .update(applications)
        .set({ isRevoked: true })
        .where(eq(applications.id, id))
        .execute();

      return true;
    });

    return result;
  } catch (error) {
    throw new Error(
      `Failed to revoke application: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function undoRevokeApplication(id: string) {
  try {
    const app = await getApplicationById(id);

    if (!app) {
      throw new Error("Application not found");
    }

    const result = await db.transaction(async (tx) => {
      await tx
        .update(applications)
        .set({ isRevoked: false })
        .where(eq(applications.id, id))
        .execute();

      return true;
    });

    return result;
  } catch (error) {
    throw new Error(
      `Failed to undo revoke application: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

export async function disableApplication(id: string) {
  try {
    const app = await getApplicationById(id);

    if (!app) {
      throw new Error("Application not found");
    }

    const result = await db.transaction(async (tx) => {
      await tx
        .update(applications)
        .set({ isActive: false })
        .where(eq(applications.id, id))
        .execute();

      return true;
    });

    return result;
  } catch (error) {
    throw new Error(
      `Failed to disable application: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function enableApplication(id: string) {
  try {
    const app = await getApplicationById(id);

    if (!app) {
      throw new Error("Application not found");
    }

    const result = await db.transaction(async (tx) => {
      await tx
        .update(applications)
        .set({ isActive: true })
        .where(eq(applications.id, id))
        .execute();

      return true;
    });

    return result;
  } catch (error) {
    throw new Error(
      `Failed to enable application: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function deleteApplication(id: string) {
  try {
    const app = await getApplicationById(id);

    if (!app) {
      throw new Error("Application not found");
    }

    const result = await db.transaction(async (tx) => {
      await tx.delete(applications).where(eq(applications.id, id)).execute();

      return true;
    });

    return result;
  } catch (error) {
    throw new Error(
      `Failed to delete application: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
