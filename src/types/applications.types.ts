import { type applications } from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import { type BugModel } from "./bugs.types";
import { type ImageModel } from "./bug-images.types";

export type SelectApplication = typeof applications.$inferSelect;

export type InsertApplication = typeof applications.$inferInsert;

// Define base types from Drizzle schema
type ApplicationModel = InferSelectModel<typeof applications>;

// Define the return type with presigned URLs
export type ApplicationWithPresignedUrls = Omit<ApplicationModel, "secret"> & {
  bugs: Array<
    BugModel & {
      images: Array<ImageModel & { url: string }>;
    }
  >;
};
