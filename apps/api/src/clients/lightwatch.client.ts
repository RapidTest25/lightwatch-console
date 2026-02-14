import { env } from "../config/env";
import { ApiError } from "../utils/api-error";

// ─── Types ───────────────────────────────────────────────────────────

export interface ClientRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
  timeoutMs?: number;
}

interface LightwatchErrorBody {
  message?: string;
  error?: string;
}

// ─── Query string helper ─────────────────────────────────────────────

function buildQueryString(
  params: Record<string, string | string[] | undefined>,
): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v));
    } else {
      qs.append(key, value);
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

// ─── Client ──────────────────────────────────────────────────────────

export async function lightwatchClient<T = unknown>(
  options: ClientRequestOptions,
): Promise<T> {
  const {
    method = "GET",
    path,
    query,
    body,
    timeoutMs = env.requestTimeoutMs,
  } = options;

  const url = `${env.lightwatchApiBaseUrl}${path}${query ? buildQueryString(query) : ""}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": env.lightwatchApiKey,
  };

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      let detail: LightwatchErrorBody | string | undefined;
      try {
        detail = (await res.json()) as LightwatchErrorBody;
      } catch {
        detail = await res.text();
      }
      const message =
        (typeof detail === "object" && (detail.message || detail.error)) ||
        `Lightwatch API responded with ${res.status}`;
      throw ApiError.upstream(res.status, message, detail);
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;

    if (err instanceof DOMException && err.name === "AbortError") {
      throw ApiError.timeout();
    }

    throw new ApiError(
      502,
      "Failed to reach Lightwatch API",
      "UPSTREAM_UNREACHABLE",
      (err as Error).message,
    );
  } finally {
    clearTimeout(timer);
  }
}
