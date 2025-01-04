import { relations } from "drizzle-orm/relations";
import { applications, bugImages, bugs } from "./schema";

export const applicationRelations = relations(applications, ({ many }) => ({
  bugs: many(bugs),
}));

export const bugRelations = relations(bugs, ({ one, many }) => ({
  application: one(applications),
  images: many(bugImages),
}));
