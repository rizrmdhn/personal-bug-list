import { type bugs } from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import { BugImageWithUrl, type ImageModel } from "./bug-images.types";
import { PaginationWithEnhanceDataOptions } from "@/server/db/utils";

export type BugModel = InferSelectModel<typeof bugs>;

export type BugModelWithPresignedUrls = BugModel & {
  images: Array<ImageModel & { url: string }>;
};

export type GetBugsOptions = PaginationWithEnhanceDataOptions<
  typeof bugs.$inferSelect & { images: ImageModel[] },
  typeof bugs.$inferSelect & { images: BugImageWithUrl[] }
>;
