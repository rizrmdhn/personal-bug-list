import { type Meta } from "@/types/api-response.types";

export function formatResponse<T>(meta: Meta, data: T): Response {
  return Response.json(
    {
      meta,
      data,
    },
    { status: meta.code, statusText: meta.message },
  );
}

export function formatErrorResponse(meta: Meta): Response {
  return Response.json(
    {
      meta,
    },
    { status: meta.code, statusText: meta.message },
  );
}

export function createStringFormattedResponse<T>(
  status: "success" | "error",
  code: number,
  message: string,
  data: T,
): string {
  return JSON.stringify(
    formatResponse(
      {
        code: code,
        status,
        message,
      },
      data,
    ),
  );
}

export function formatError(message: string, code = 500): Response {
  return formatErrorResponse({
    code,
    status: "error",
    message,
  });
}

// Common error responses
export const unauthorizedError = () => formatError("Unauthorized", 401);

export const badRequestError = (message = "Bad Request") =>
  formatError(message, 400);

export const notFoundError = (resource = "Resource") =>
  formatError(`${resource} not found`, 404);

export const serverError = (message = "Internal Server Error") =>
  formatError(message, 500);
