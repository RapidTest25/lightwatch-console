import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error";

export interface StandardResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    const body: StandardResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error("[unhandled]", err);

  const body: StandardResponse = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  };
  res.status(500).json(body);
}
