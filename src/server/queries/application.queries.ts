import { applications } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "../db";

export async function getApplicationBySecret(secret: string) {
  const app = await db.query.applications.findFirst({
    where: eq(applications.secret, secret),
  });

  return app;
}

export async function getApplicationByKeyAndName(key: string, name: string) {
  const app = await db.query.applications.findFirst({
    where: and(eq(applications.key, key), eq(applications.name, name)),
  });

  return app;
}
