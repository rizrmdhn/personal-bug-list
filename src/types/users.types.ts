import { type InferInsertModel } from "drizzle-orm";
import { type InferQueryModel } from "./utils.types";
import { type users } from "@/server/db/schema";

export type Users = InferQueryModel<
  "users",
  {
    columns: {
      password: false;
    };
  }
>;

export type InsertUser = InferInsertModel<typeof users>;
