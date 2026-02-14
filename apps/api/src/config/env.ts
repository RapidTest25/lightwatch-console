export interface EnvConfig {
  port: number;
  lightwatchApiBaseUrl: string;
  lightwatchRealtimeUrl: string;
  lightwatchApiKey: string;
  requestTimeoutMs: number;
  nodeEnv: string;
  sessionSecret: string;
  consoleUsername: string;
  consolePasswordHash: string;
  secureCookies: boolean;
  authEnabled: boolean;
}

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export function loadEnv(): EnvConfig {
  const nodeEnv = optional("NODE_ENV", "development");
  const authEnabled = optional("AUTH_ENABLED", "false") === "true";
  return {
    port: parseInt(optional("PORT", "4000"), 10),
    lightwatchApiBaseUrl: optional(
      "LIGHTWATCH_API_BASE_URL",
      "http://localhost:3003",
    ),
    lightwatchRealtimeUrl: optional(
      "LIGHTWATCH_REALTIME_URL",
      "http://localhost:3002",
    ),
    lightwatchApiKey: optional("LIGHTWATCH_API_KEY", ""),
    requestTimeoutMs: parseInt(optional("REQUEST_TIMEOUT_MS", "10000"), 10),
    nodeEnv,
    sessionSecret: optional("SESSION_SECRET", "dev-secret-change-me"),
    consoleUsername: optional("CONSOLE_USERNAME", "admin"),
    consolePasswordHash: optional("CONSOLE_PASSWORD_HASH", ""),
    secureCookies: nodeEnv === "production",
    authEnabled,
  };
}

export const env = loadEnv();
