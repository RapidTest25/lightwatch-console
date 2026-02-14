import { lightwatchClient } from "../clients/lightwatch.client";

export interface Alert {
  id: string;
  name: string;
  condition: string;
  status: string;
  [key: string]: unknown;
}

export interface CreateAlertPayload {
  name: string;
  condition: string;
  threshold: number;
  service?: string;
  [key: string]: unknown;
}

export async function getAlerts(
  query: Record<string, string | undefined>,
): Promise<Alert[]> {
  const response = await lightwatchClient<{ data: Alert[] | null }>({
    path: "/api/alerts",
    query,
  });
  return response.data ?? [];
}

export async function createAlert(payload: CreateAlertPayload): Promise<Alert> {
  const response = await lightwatchClient<{ data: Alert }>({
    method: "POST",
    path: "/api/alerts",
    body: payload,
  });
  return response.data;
}
