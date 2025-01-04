// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  AVALIABLE_BUG_SEVERITY,
  AVALIABLE_BUG_STATUS,
  AVALIABLE_BUG_TAG,
} from "@/lib/constants";
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `personal-bug-list_${name}`,
);

export const bugSeverityEnum = pgEnum("bug_severity", AVALIABLE_BUG_SEVERITY);

export const bugTagEnum = pgEnum("bug_tag", AVALIABLE_BUG_TAG);

export const bugStatusEnum = pgEnum("bug_status", AVALIABLE_BUG_STATUS);

export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => [
    unique("post_name_unique").on(table.name),
    index("post_name_idx").using("btree", table.name),
  ],
);

export const users = createTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$default(() => uuidv7()),
    username: varchar("username", { length: 50 }).notNull(),
    password: varchar("password", { length: 150 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .$default(() => sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    unique("username_unique").on(table.username),
    index("username_idx").using("btree", table.username),
    index("user_idx").using("btree", table.id),
  ],
);

export const applications = createTable(
  "applications",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$default(() => uuidv7()),
    name: varchar("name", { length: 50 }).notNull(),
    key: text("key").notNull(),
    secret: text("secret").notNull(),
    isRevoked: boolean("is_revoked").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .$default(() => sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    unique("application_key_unique").on(table.key),
    index("application_key_idx").using("btree", table.key),
    index("application_idx").using("btree", table.id),
  ],
);

export const bugs = createTable(
  "bugs",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$default(() => uuidv7()),
    appId: uuid("app_id")
      .notNull()
      .references(() => applications.id, {
        onDelete: "cascade",
      }),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description").notNull(),
    severity: bugSeverityEnum("severity").notNull(),
    tags: bugTagEnum("tags").notNull(),
    status: bugStatusEnum("status").notNull().default("SUBMITTED"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .$default(() => sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    index("bug_id_idx").using("btree", table.id),
    index("bug_app_id_idx").using("btree", table.appId),
    index("bug_title_idx").using("btree", table.title),
    index("bug_severity_idx").using("btree", table.severity),
    index("bug_tags_idx").using("btree", table.tags),
    index("bug_status_idx").using("btree", table.status),
    index("bug_created_at_idx").using("btree", table.createdAt),
  ],
);

export const bugImages = createTable(
  "bug_images",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$default(() => uuidv7()),
    bugId: uuid("bug_id")
      .notNull()
      .references(() => bugs.id, {
        onDelete: "cascade",
      }),
    file: varchar("file", { length: 256 }).notNull(),
    fileName: varchar("file_name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .$default(() => sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    index("bug_image_id_idx").using("btree", table.id),
    index("bug_image_bug_id_idx").using("btree", table.bugId),
    index("bug_image_created_at_idx").using("btree", table.createdAt),
  ],
);
