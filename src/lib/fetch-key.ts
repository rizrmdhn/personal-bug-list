import { type NextRequest } from "next/server";
import { ApiError } from "./api-error";
import {
  getApplicationByKeyAndName,
  getApplicationBySecret,
} from "@/server/queries/application.queries";

const getHeaderValue = (req: NextRequest, header: string) => {
  const value = req.headers.get(header);
  if (!value) {
    throw ApiError.badRequest(`${header} not provided`);
  }
  return value;
};

const validateApplication = async (authToken: string) => {
  const app = await getApplicationBySecret(authToken);
  if (!app) {
    throw ApiError.unauthorized("Invalid credentials");
  }
};

const validateAppCredentials = async (appKey: string, appName: string) => {
  const appKeyMatch = await getApplicationByKeyAndName(appKey, appName);
  if (!appKeyMatch) {
    throw ApiError.unauthorized("Invalid credentials");
  }
};

export async function fetchKey(req: NextRequest) {
  const authToken = getHeaderValue(req, "Authorization");
  await validateApplication(authToken);

  const appKey = getHeaderValue(req, "X-App-Key");
  const appName = getHeaderValue(req, "X-App-Name");
  await validateAppCredentials(appKey, appName);

  return { appKey, appName, authToken };
}