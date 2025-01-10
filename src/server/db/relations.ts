import { relations } from "drizzle-orm/relations";
import { applications, bugImages, bugs, sessions, users } from "./schema";

export const sessionRelations = relations(sessions, ({ one }) => ({
  users: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const applicationRelations = relations(applications, ({ many }) => ({
  bugs: many(bugs),
}));

export const bugRelations = relations(bugs, ({ one, many }) => ({
  application: one(applications, {
    fields: [bugs.appId],
    references: [applications.id],
  }),
  images: many(bugImages),
}));

export const bugImageRelations = relations(bugImages, ({ one }) => ({
  bug: one(bugs, {
    fields: [bugImages.bugId],
    references: [bugs.id],
  }),
}));
