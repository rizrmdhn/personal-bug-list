import { type bugImages } from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";

export type ImageModel = InferSelectModel<typeof bugImages>;
