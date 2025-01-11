import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getBugs } from "@/server/queries/bugs.queries";

export const bugsRouter = createTRPCRouter({
  paginate: protectedProcedure
    .input(
      z.object({
        applicationId: z.string().min(1).max(50),
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
        input: {
          applicationId,
          page,
          pageSize,
          sortBy,
          orderBy,
          query,
          simpleSearch,
        },
      }) => {
        const result = await getBugs(applicationId, {
          limit: pageSize,
          page,
          sortBy,
          sortDirection: orderBy,
          query: query,
          simpleSearch,
        });

        return result;
      },
    ),
});
