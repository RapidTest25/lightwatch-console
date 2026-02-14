import { lightwatchClient } from "../clients/lightwatch.client";

export interface ServiceRecord {
  id: string;
  name: string;
  status: string;
  [key: string]: unknown;
}

export async function getServices(
  query: Record<string, string | undefined>,
): Promise<ServiceRecord[]> {
  const response = await lightwatchClient<{ data: ServiceRecord[] }>({
    path: "/api/services",
    query,
  });
  return response.data ?? [];
}
