import { type sessions } from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import { type Users } from "./users.types";

export type Sessions = InferSelectModel<typeof sessions>;

export type SessionValidationResult =
  | { session: Sessions; user: Users }
  | { session: null; user: null };
