import type { JWTPayload as JoseJWTPayload } from "jose";

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface JWTPayload extends JoseJWTPayload {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string | null;
}
