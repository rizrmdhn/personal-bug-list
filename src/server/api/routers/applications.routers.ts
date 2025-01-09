import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createApplication,
  disableApplication,
  enableApplication,
  getApplicationList,
  getCursorBasedApplicationList,
  revokeApplication,
  undoRevokeApplication,
} from "@/server/queries/application.queries";
import { createApplicationSchema } from "@/schema/application.schema";

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
        sortBy: z.string().optional(),
        orderBy: z.enum(["asc", "desc"]).optional(),
        query: z.string().optional(),
        simpleSearch: z.boolean().optional().default(false),
      }),
    )
    .query(
      async ({
        input: { page, pageSize, sortBy, orderBy, query, simpleSearch },
      }) => {
        const result = await getApplicationList({
          limit: pageSize,
          page,
          sortBy,
          orderBy,
          orderDirection: orderBy,
          sortDirection: orderBy,
          query: query,
          simpleSearch,
        });

        return result;
      },
    ),

  create: protectedProcedure
    .input(createApplicationSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.transaction(async (trx) => {
        return await createApplication(trx, input);
      });

      return result;
    }),

  enable: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const result = await enableApplication(input.id);

      return result;
    }),

  disable: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const result = await disableApplication(input.id);

      return result;
    }),

  revoke: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const result = await revokeApplication(input.id);

      return result;
    }),

  undoRevoke: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const result = await undoRevokeApplication(input.id);

      return result;
    }),
});
