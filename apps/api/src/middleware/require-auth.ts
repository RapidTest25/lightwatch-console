import type { Request, Response, NextFunction } from "express";
import { getSession, SESSION_COOKIE } from "../utils/session";
import { ApiError } from "../utils/api-error";
import { env } from "../config/env";

/**
 * Middleware that validates the session cookie on protected routes.
 * Skips /health and /auth/* endpoints.
 * When AUTH_ENABLED=false, all routes are accessible without auth.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Skip auth entirely when disabled
  if (!env.authEnabled) {
    return next();
  }

  // Allow unauthenticated access to health + auth endpoints
  if (req.path === "/health" || req.path.startsWith("/auth")) {
    return next();
  }

  const sessionId = parseCookie(req.headers.cookie, SESSION_COOKIE);

  if (!sessionId) {
    throw ApiError.unauthorized("Authentication required");
  }

  const session = getSession(sessionId);
  if (!session) {
    throw ApiError.unauthorized("Session expired or invalid");
  }

  // Attach session info to request for downstream handlers
  (req as AuthenticatedRequest).session = session;
  next();
}

// ─── Helpers ─────────────────────────────────────────────────────────

function parseCookie(
  header: string | undefined,
  name: string,
): string | undefined {
  if (!header) return undefined;
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1];
}

// ─── Augmented request type ──────────────────────────────────────────

export interface AuthenticatedRequest extends Request {
  session: {
    username: string;
    createdAt: number;
    expiresAt: number;
  };
}
