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
  tags: () => z.array(z.enum(AVALIABLE_BUG_TAG)),
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

export const paginateBugsSchema = z.object({
  applicationId: z.string().min(1).max(50),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(10),
  sortBy: z.string().optional(),
  orderBy: z.enum(["asc", "desc"]).optional(),
  query: z.string().optional(),
  simpleSearch: z.boolean().optional().default(false),
  enhanceDataFn: z.function().optional(),
});

export type PaginateBugsSchemaType = z.infer<typeof paginateBugsSchema>;
