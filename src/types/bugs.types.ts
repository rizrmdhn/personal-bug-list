import { type bugs } from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import { type ImageModel } from "./bug-images.types";

export type BugModel = InferSelectModel<typeof bugs>;

export type BugModelWithPresignedUrls = BugModel & {
  images: Array<ImageModel & { url: string }>;
};
