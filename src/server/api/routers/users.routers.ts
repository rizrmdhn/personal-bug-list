import { createTRPCRouter, publicProcedure } from "../trpc";

export const usersRouter = createTRPCRouter({
  test: publicProcedure.query(async () => {
    return "Hello World";
  }),
});
