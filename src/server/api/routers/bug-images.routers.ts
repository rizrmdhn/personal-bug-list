import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getBugImages } from "@/server/queries/bug-images.queries";

export const bugImagesRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        bugId: z.string(),
      }),
    )
    .query(async ({ input: { bugId } }) => {
      const result = await getBugImages(bugId);
      return result;
    }),
});
