import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import {
  createSession,
  destroySession,
  verifyPassword,
  SESSION_COOKIE,
} from "../utils/session";
import { ApiError } from "../utils/api-error";
import type { StandardResponse } from "../middleware/error-handler";

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      throw ApiError.badRequest("Username and password are required");
    }

    if (username !== env.consoleUsername || !verifyPassword(password)) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    const { sessionId, maxAgeMs } = createSession(username);

    res.setHeader("Set-Cookie", serializeCookie(sessionId, maxAgeMs));

    const body: StandardResponse<{ username: string }> = {
      success: true,
      data: { username },
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const sessionId = parseCookie(req.headers.cookie, SESSION_COOKIE);
  if (sessionId) {
    destroySession(sessionId);
  }

  // Clear cookie
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
  );

  const body: StandardResponse = { success: true };
  res.json(body);
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sessionId = parseCookie(req.headers.cookie, SESSION_COOKIE);
    if (!sessionId) {
      throw ApiError.unauthorized();
    }

    const { getSession } = await import("../utils/session");
    const session = getSession(sessionId);
    if (!session) {
      throw ApiError.unauthorized("Session expired");
    }

    const body: StandardResponse<{ username: string }> = {
      success: true,
      data: { username: session.username },
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function serializeCookie(sessionId: string, maxAgeMs: number): string {
  const parts = [
    `${SESSION_COOKIE}=${sessionId}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  if (env.secureCookies) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

function parseCookie(
  header: string | undefined,
  name: string,
): string | undefined {
  if (!header) return undefined;
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1];
}
