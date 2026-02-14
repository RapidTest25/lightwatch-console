import crypto from 'crypto';
import { env } from '../config/env';

// ─── In-memory session store ─────────────────────────────────────────
// For production at scale, replace with Redis.

interface Session {
  username: string;
  createdAt: number;
  expiresAt: number;
}

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // 15 min

const sessions = new Map<string, Session>();

// Periodic cleanup of expired sessions
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(id);
    }
  }
}, CLEANUP_INTERVAL_MS);

// Allow process to exit without waiting for the timer
if (cleanupTimer.unref) cleanupTimer.unref();

// ─── Public API ──────────────────────────────────────────────────────

export function createSession(username: string): { sessionId: string; maxAgeMs: number } {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  sessions.set(sessionId, {
    username,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  });
  return { sessionId, maxAgeMs: SESSION_TTL_MS };
}

export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

export function destroySession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function destroyAllSessions(): void {
  sessions.clear();
}

export function verifyPassword(plaintext: string): boolean {
  const hash = crypto.createHash('sha256').update(plaintext).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(env.consolePasswordHash, 'hex'),
  );
}

export const SESSION_COOKIE = 'lw_session';
