import "server-only";

import { type createBugSchema } from "@/schema/bugs.schema";
import { type DBType } from "../db";
import { type z } from "zod";
import { bugs } from "../db/schema";

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
