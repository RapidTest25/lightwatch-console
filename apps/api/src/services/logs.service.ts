import { lightwatchClient } from "../clients/lightwatch.client";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  service?: string;
  [key: string]: unknown;
}

export async function getLogs(
  query: Record<string, string | undefined>,
): Promise<LogEntry[]> {
  const response = await lightwatchClient<{ data: LogEntry[] }>({
    path: "/api/logs",
    query,
  });
  return response.data ?? [];
}
