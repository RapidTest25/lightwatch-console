import { lightwatchClient } from "../clients/lightwatch.client";

export interface SecurityEvent {
  id: string;
  type: string;
  severity: string;
  timestamp: string;
  [key: string]: unknown;
}

export async function getSecurityEvents(
  query: Record<string, string | undefined>,
): Promise<SecurityEvent[]> {
  const response = await lightwatchClient<{ data: SecurityEvent[] }>({
    path: "/api/security/events",
    query,
  });
  return response.data ?? [];
}
