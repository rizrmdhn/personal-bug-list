import { applications } from "@/server/db/schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const createApplication = createInsertSchema(applications, {
  key: () => z.string().min(1).max(200),
  name: () => z.string().min(1).max(200),
  secret: () => z.string().min(1).max(200),
}).pick({
  key: true,
  name: true,
  secret: true,
});

export const updateApplication = createUpdateSchema(applications, {
  name: () => z.string().min(1).max(200),
  isActive: () => z.boolean(),
  isRevoked: () => z.boolean(),
}).pick({
  name: true,
  isActive: true,
  isRevoked: true,
});
