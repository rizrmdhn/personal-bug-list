import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getApplicationList } from "@/server/queries/application.queries";

export const applicationsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().default(10),
      }),
    )
    .query(async ({ input: { limit, page } }) => {
      const result = await getApplicationList(page, limit);

      return result;
    }),
});
