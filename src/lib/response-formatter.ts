import {
  type ApiErrorResponse,
  type ApiResponse,
  type Meta,
} from "@/types/api-response.types";

export function formatResponse<T>(meta: Meta, data: T): ApiResponse<T> {
  return {
    meta,
    data,
  };
}

export function formatErrorResponse(meta: Meta): ApiErrorResponse {
  return {
    meta,
  };
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
