import { type bugs } from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";

export type BugModel = InferSelectModel<typeof bugs>;
