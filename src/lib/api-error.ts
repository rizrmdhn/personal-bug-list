import { formatErrorResponse } from "./response-formatter";

export class ApiError extends Error {
  constructor(code: number, message: string) {
    super(message);
    this.name = "ApiError";

    // Create and throw the formatted Response
    throw formatErrorResponse({
      code,
      status: "error",
      message,
    });
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static badRequest(message = "Bad request") {
    return new ApiError(400, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }
}
