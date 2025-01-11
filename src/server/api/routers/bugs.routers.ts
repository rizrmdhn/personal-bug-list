import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getBugs } from "@/server/queries/bugs.queries";
import { paginateBugsSchema } from "@/schema/bugs.schema";

export const bugsRouter = createTRPCRouter({
  paginate: protectedProcedure
    .input(paginateBugsSchema)
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
