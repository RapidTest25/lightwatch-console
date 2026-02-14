import { lightwatchClient } from "../clients/lightwatch.client";

export interface MetricEntry {
  id: string;
  name: string;
  value: number;
  timestamp: string;
  [key: string]: unknown;
}

export async function getMetrics(
  query: Record<string, string | undefined>,
): Promise<MetricEntry[]> {
  const response = await lightwatchClient<{ data: MetricEntry[] }>({
    path: "/api/metrics",
    query,
  });
  return response.data ?? [];
}
