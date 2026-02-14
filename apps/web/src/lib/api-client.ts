import type {
  ApiResponse,
  ServiceRecord,
  LogEntry,
  LogFilters,
  MetricEntry,
  SecurityEvent,
  Alert,
  CreateAlertPayload,
} from "@lightwatch/shared";

// ─── Config ──────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// ─── Helpers ─────────────────────────────────────────────────────────

function qs(params?: Record<string, string | number | undefined>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) sp.append(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function request<T>(
  path: string,
  init?: RequestInit,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    signal,
  });

  const body: ApiResponse<T> = await res.json();

  if (!body.success || body.error) {
    throw new Error(body.error?.message ?? `Request failed (${res.status})`);
  }

  return body.data as T;
}

// ─── Public API ──────────────────────────────────────────────────────

export function getServices(signal?: AbortSignal): Promise<ServiceRecord[]> {
  return request<ServiceRecord[]>("/v1/services", undefined, signal);
}

export function getLogs(
  filters?: LogFilters,
  signal?: AbortSignal,
): Promise<LogEntry[]> {
  return request<LogEntry[]>(
    `/v1/logs${qs(filters as Record<string, string | number | undefined>)}`,
    undefined,
    signal,
  );
}

export function getMetrics(
  params?: Record<string, string>,
  signal?: AbortSignal,
): Promise<MetricEntry[]> {
  return request<MetricEntry[]>(`/v1/metrics${qs(params)}`, undefined, signal);
}

export function getSecurityEvents(
  params?: Record<string, string>,
  signal?: AbortSignal,
): Promise<SecurityEvent[]> {
  return request<SecurityEvent[]>(
    `/v1/security${qs(params)}`,
    undefined,
    signal,
  );
}

export function getAlerts(signal?: AbortSignal): Promise<Alert[]> {
  return request<Alert[]>("/v1/alerts", undefined, signal);
}

export function createAlert(
  payload: CreateAlertPayload,
  signal?: AbortSignal,
): Promise<Alert> {
  return request<Alert>(
    "/v1/alerts",
    { method: "POST", body: JSON.stringify(payload) },
    signal,
  );
}
