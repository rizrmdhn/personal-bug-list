import { type applications } from "@/server/db/schema";

export type SelectApplication = typeof applications.$inferSelect;

export type InsertApplication = typeof applications.$inferInsert;
