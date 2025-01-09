import "server-only";

import { type DBType } from "../db";
import { bugImages } from "../db/schema";

export async function createBugImages(db: DBType, bugId: string, file: string) {
  try {
    const [bugImage] = await db
      .insert(bugImages)
      .values({
        bugId,
        file,
      })
      .returning()
      .execute();

    if (!bugImage) {
      throw new Error("Failed to create bug image");
    }

    return bugImage;
  } catch (error) {
    throw new Error(
      `Failed to create bug image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}
