export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = "INTERNAL_ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, "BAD_REQUEST", details);
  }
  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message, "UNAUTHORIZED");
  }
  static notFound(message: string): ApiError {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static timeout(message = "Upstream request timed out"): ApiError {
    return new ApiError(504, message, "GATEWAY_TIMEOUT");
  }

  static upstream(
    statusCode: number,
    message: string,
    details?: unknown,
  ): ApiError {
    return new ApiError(statusCode, message, "UPSTREAM_ERROR", details);
  }
}
