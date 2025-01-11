import "server-only";

import { type createBugSchema } from "@/schema/bugs.schema";
import { db, type DBType } from "../db";
import { type z } from "zod";
import { bugImages, bugs } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { paginateWithEnhanceData, type SortableColumn } from "../db/utils";
import {
  type BugImageWithUrl,
  type ImageModel,
} from "@/types/bug-images.types";
import { generatePresignedUrl } from "../storage";
import { type GetBugsOptions } from "@/types/bugs.types";

export async function getDetailBug(bugId: string) {
  const details = await db.query.bugs.findFirst({
    where: eq(bugs.id, bugId),
    with: {
      images: true,
    },
  });

  return details;
}

export async function getBugs(appId: string, options: GetBugsOptions) {
  try {
    const enhanceDataWithUrls = async (
      items: (typeof bugs.$inferSelect & { images: ImageModel[] })[],
    ): Promise<
      (typeof bugs.$inferSelect & { images: BugImageWithUrl[] })[]
    > => {
      return Promise.all(
        items.map(async (item) => ({
          ...item,
          images: await Promise.all(
            item.images.map(
              async (image): Promise<BugImageWithUrl> => ({
                ...image,
                url: await generatePresignedUrl({
                  bucketName: "bugs",
                  fileName: image.file,
                  folderPath: "images",
                }),
              }),
            ),
          ),
        })),
      );
    };

    const baseQuery = db
      .select({
        id: bugs.id,
        title: bugs.title,
        description: bugs.description,
        severity: bugs.severity,
        appId: bugs.appId,
        tags: bugs.tags,
        status: bugs.status,
        createdAt: bugs.createdAt,
        updatedAt: bugs.updatedAt,
        images: sql<ImageModel[]>`
          COALESCE(
            json_agg(
              CASE WHEN ${bugImages.id} IS NOT NULL THEN
                json_build_object(
                  'id', ${bugImages.id},
                  'file', ${bugImages.file}
                )
              END
            ) FILTER (WHERE ${bugImages.id} IS NOT NULL),
            '[]'
          )
        `,
      })
      .from(bugs)
      .where(eq(bugs.appId, appId))
      .leftJoin(bugImages, eq(bugs.id, bugImages.bugId))
      .groupBy(
        bugs.id,
        bugs.title,
        bugs.description,
        bugs.severity,
        bugs.appId,
        bugs.tags,
        bugs.status,
        bugs.createdAt,
        bugs.updatedAt,
      )
      .$dynamic();

    const sortableColumns: SortableColumn[] = [
      { column: bugs.createdAt, name: "createdAt" },
      { column: bugs.updatedAt, name: "updatedAt" },
      { column: bugs.severity, name: "title" },
      { column: bugs.status, name: "status" },
    ];

    const opts: GetBugsOptions = {
      ...options,
      searchColumns: [bugs.status],
      enhanceDataFn: enhanceDataWithUrls,
      sortBy: options.sortBy ?? "createdAt",
      sortDirection: options.sortDirection ?? "desc",
    };

    return await paginateWithEnhanceData<
      typeof baseQuery,
      typeof bugs.$inferSelect & { images: ImageModel[] },
      typeof bugs.$inferSelect & { images: BugImageWithUrl[] }
    >(baseQuery, bugs, sortableColumns, opts);
  } catch (error) {
    console.error("Application list fetch error:", error);
    throw new Error(
      `Failed to fetch application list: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function createBugs(
  db: DBType,
  appId: string,
  input: z.infer<typeof createBugSchema>,
) {
  try {
    const [bug] = await db
      .insert(bugs)
      .values({
        appId,
        ...input,
      })
      .returning()
      .execute();

    if (!bug) {
      throw new Error("Failed to create bug");
    }

    return bug;
  } catch (error) {
    throw new Error(
      `Failed to create bug: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
