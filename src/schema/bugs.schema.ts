import {
  AVALIABLE_BUG_SEVERITY,
  AVALIABLE_BUG_STATUS,
  AVALIABLE_BUG_TAG,
} from "@/lib/constants";
import { bugs } from "@/server/db/schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const createBugSchema = createInsertSchema(bugs, {
  title: () => z.string().min(1).max(200),
  description: () => z.string().min(1).max(2555),
  severity: () => z.enum(AVALIABLE_BUG_SEVERITY),
  tags: () => z.enum(AVALIABLE_BUG_TAG),
  status: () => z.enum(AVALIABLE_BUG_STATUS).default("SUBMITTED"),
}).pick({
  title: true,
  description: true,
  severity: true,
  tags: true,
  status: true,
});

export type CreateBugSchemaType = z.infer<typeof createBugSchema>;

export const updateBugSchema = createUpdateSchema(bugs, {
  title: () => z.string().min(1).max(200),
  description: () => z.string().min(1).max(2555),
  severity: () => z.enum(AVALIABLE_BUG_SEVERITY),
  tags: () => z.enum(AVALIABLE_BUG_TAG),
  status: () => z.enum(AVALIABLE_BUG_STATUS),
}).pick({
  title: true,
  description: true,
  severity: true,
  tags: true,
  status: true,
});
