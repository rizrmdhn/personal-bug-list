import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const usersRouter = createTRPCRouter({
  test: publicProcedure.query(async () => {
    return "Hello World";
  }),
});
