import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  getApplicationList,
  getCursorBasedApplicationList,
} from "@/server/queries/application.queries";

export const applicationsRouter = createTRPCRouter({
  cursor: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10), // <-- "limit" needs to exist, but can be any type
        cursor: z.string().optional(), // <-- "cursor" needs to exist, but can be any type
        direction: z.enum(["forward", "backward"]), // optional, useful for bi-directional query
      }),
    )
    .query(async ({ input: { cursor, limit, direction } }) => {
      const result = await getCursorBasedApplicationList({
        cursor,
        limit,
        direction,
      });

      return result;
    }),
  paginate: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ input: { page, pageSize } }) => {
      const result = await getApplicationList({
        limit: pageSize,
        page,
      });

      return result;
    }),
});
