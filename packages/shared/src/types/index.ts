// ─── Services ────────────────────────────────────────────────────────

export interface ServiceRecord {
  id: string;
  name: string;
  status: string;
  host?: string;
  last_heartbeat?: string;
  meta?: Record<string, unknown>;
  created_at?: string;
}

// ─── Logs ────────────────────────────────────────────────────────────

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  service?: string;
  meta?: Record<string, unknown>;
  received_at?: string;
}

export interface LogFilters {
  service?: string;
  level?: LogLevel;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// ─── Metrics ─────────────────────────────────────────────────────────

export interface MetricEntry {
  id: string;
  name: string;
  value: number;
  unit?: string;
  timestamp: string;
  service?: string;
  tags?: Record<string, string>;
}

// ─── Security ────────────────────────────────────────────────────────

export type SecuritySeverity = "low" | "medium" | "high" | "critical";

export interface SecurityEvent {
  id: string;
  type: string;
  severity: SecuritySeverity;
  source_ip?: string;
  description?: string;
  service?: string;
  timestamp: string;
  received_at?: string;
}

// ─── Alerts ──────────────────────────────────────────────────────────

export type AlertOperator = "gt" | "gte" | "lt" | "lte" | "eq" | "neq";
export type AlertStatus = "active" | "resolved" | "muted";

export interface Alert {
  id: string;
  name: string;
  service?: string;
  metric: string;
  operator: AlertOperator;
  threshold: number;
  duration: string;
  status: AlertStatus;
  createdAt: string;
}

export interface CreateAlertPayload {
  name: string;
  service?: string;
  metric: string;
  operator: AlertOperator;
  threshold: number;
  duration: string;
}

// ─── API Envelope ────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ─── WebSocket Messages ──────────────────────────────────────────────

export type WsChannel = "logs" | "alerts" | "metrics" | "security";

export interface WsMessage<T = unknown> {
  channel: WsChannel;
  data: T;
  timestamp: string;
}
