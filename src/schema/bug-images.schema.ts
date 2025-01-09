import { bugImages } from "@/server/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const createBugImageSchema = createInsertSchema(bugImages, {
  file: () => z.array(z.string()).optional(),
}).pick({
  file: true,
});

export type CreateBugImageSchemaType = z.infer<typeof createBugImageSchema>;

export const createBugImageFileSchema = createInsertSchema(bugImages, {
  file: () =>
    z
      .array(
        z
          .instanceof(File)
          .refine(
            (file) =>
              ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
            {
              message:
                "Invalid file type supplied. Only PNG, JPEG, and JPG are allowed.",
            },
          ),
      )
      .min(1),
}).pick({
  file: true,
});

export type CreateBugImageFileSchemaType = z.infer<
  typeof createBugImageFileSchema
>;
