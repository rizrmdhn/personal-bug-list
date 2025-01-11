import { type NextRequest } from "next/server";
import { ApiError } from "./api-error";
import { getApplicationByKey } from "@/server/queries/application.queries";
import { verify } from "@node-rs/argon2";

const getHeaderValue = (req: NextRequest, header: string) => {
  const value = req.headers.get(header);
  if (!value) {
    throw ApiError.badRequest(`${header} not provided`);
  }
  return value;
};

const validateAppCredentials = async (appKey: string, appSecret: string) => {
  const appKeyMatch = await getApplicationByKey(appKey);

  if (!appKeyMatch) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  if (!appKeyMatch.isActive) {
    throw ApiError.forbidden("Application is inactive");
  }

  if (appKeyMatch.isRevoked) {
    throw ApiError.forbidden("Application is revoked");
  }

  // remove bearer from the appSecret
  const cleanAppSecret = appSecret.replace("Bearer ", "");

  const isMatch = await verify(appKeyMatch.secret, cleanAppSecret);

  if (!isMatch) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  return appKeyMatch;
};

export async function fetchKey(req: NextRequest) {
  const authToken = getHeaderValue(req, "Authorization");
  const appKey = getHeaderValue(req, "X-App-Key");
  const app = await validateAppCredentials(appKey, authToken);

  return app;
}
