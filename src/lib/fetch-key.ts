import { type NextRequest } from "next/server";
import { ApiError } from "./api-error";

export async function fetchKey(req: NextRequest) {
  // Get auth token from request headers
  const authToken = req.headers.get("Authorization");
  if (!authToken) {
    ApiError.unauthorized();
    return;
  }

  // Get app key and app name from request headers
  const appKey = req.headers.get("X-App-Key");
  const appName = req.headers.get("X-App-Name");
  if (!appKey || !appName) {
    ApiError.badRequest("App credentials not provided");
    return;
  }

  return { appKey, appName, authToken };
}
