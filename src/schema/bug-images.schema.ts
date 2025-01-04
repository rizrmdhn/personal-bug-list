import { bugImages } from "@/server/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const createBugImage = createInsertSchema(bugImages, {
  bugId: () =>
    z
      .string()
      .min(1, {
        message: "Bug ID is required",
      })
      .max(200, {
        message: "Bug ID is too long",
      }),
  file: () => z.string().min(1).max(200),
  fileName: () => z.string().min(1).max(200),
}).pick({
  bugId: true,
  file: true,
  fileName: true,
});
