import { applications } from "@/server/db/schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const createApplicationSchema = createInsertSchema(applications, {
  name: () =>
    z
      .string({
        message: "Name must be a string",
      })
      .min(5, {
        message: "Name must be at least 5 characters long",
      })
      .max(200, {
        message: "Name must be at most 200 characters long",
      }),
}).pick({
  name: true,
});

export const updateApplicationSchema = createUpdateSchema(applications, {
  name: () => z.string().min(1).max(200),
  isActive: () => z.boolean(),
  isRevoked: () => z.boolean(),
}).pick({
  name: true,
  isActive: true,
  isRevoked: true,
});
