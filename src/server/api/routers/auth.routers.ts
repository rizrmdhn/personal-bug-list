import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { getUserByUsername } from "@/server/queries/users.queries";
import { z } from "zod";
import { verify } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";
import { createTokenCookie, encrypt } from "@/lib/jwt-auth";
import { cookies } from "next/headers";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input: { username, password } }) => {
      const user = await getUserByUsername(username);

      if (!user) {
        throw new Error("User not found");
      }

      // verify password
      const verifyPasswordResult = await verify(user.password, password);

      if (!verifyPasswordResult) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid User Credentials",
        });
      }

      // Generate JWT
      const token = await encrypt({
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

      // Create session
      await createTokenCookie(token);

      return true;
    }),

  logout: protectedProcedure.mutation(async ({ ctx: { session } }) => {
    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid User Credentials",
      });
    }

    (await cookies()).delete("token");

    return true;
  }),

  details: protectedProcedure.query(async ({ ctx: { user } }) => {
    return user;
  }),
});
