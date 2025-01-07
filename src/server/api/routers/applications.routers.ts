import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getApplicationList } from "@/server/queries/application.queries";

export const applicationsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10), // <-- "limit" needs to exist, but can be any type
        cursor: z.string().optional(), // <-- "cursor" needs to exist, but can be any type
        direction: z.enum(["forward", "backward"]), // optional, useful for bi-directional query
      }),
    )
    .query(async ({ input: { cursor, limit, direction } }) => {
      const result = await getApplicationList({
        cursor,
        limit,
        direction,
      });

      return result;
    }),
});
