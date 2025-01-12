import "server-only";

import { db, type DBType } from "../db";
import { bugImages } from "../db/schema";
import { eq } from "drizzle-orm";
import { generatePresignedUrl } from "../storage";

export async function getBugImages(bugId: string) {
  const images = await db.query.bugImages.findMany({
    where: eq(bugImages.bugId, bugId),
  });

  return Promise.all(
    images.map(async (image) => ({
      ...image,
      url: await generatePresignedUrl({
        bucketName: "bugs",
        fileName: image.file,
        folderPath: "images",
      }),
    })),
  );
}

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
