import "server-only";

import { v7 as uuidv7 } from "uuid";
import { db } from "../db";
import { sessions, users } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  type SessionValidationResult,
  type Sessions,
} from "@/types/sessions.types";

export async function createSession(
  userId: string,
  expiresAt: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
): Promise<Sessions> {
  const sessionData: Sessions = {
    id: uuidv7(),
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt,
  };

  await db.insert(sessions).values(sessionData).execute();

  return sessionData;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  // get session data with user data and role data
  const result = await db
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, token));

  if (result.length < 1) {
    return { session: null, user: null };
  }

  const firstResult = result[0];
  if (!firstResult) {
    return { session: null, user: null };
  }

  const { session: sessionData, user: userData } = firstResult;

  if (Date.now() >= new Date(sessionData.expiresAt).getTime()) {
    await db.delete(sessions).where(eq(sessions.id, sessionData.id));
    return { session: null, user: null };
  }

  if (
    Date.now() >=
    new Date(sessionData.expiresAt).getTime() - 1000 * 60 * 60 * 24 * 15
  ) {
    sessionData.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessions)
      .set({
        expiresAt: sessionData.expiresAt,
      })
      .where(eq(sessions.id, sessionData.id));
  }

  return {
    session: sessionData,
    user: {
      ...userData,
    },
  };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
