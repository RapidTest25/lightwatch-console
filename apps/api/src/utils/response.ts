import type { Response } from "express";
import type { ParsedQs } from "qs";
import type { StandardResponse } from "../middleware/error-handler";

export function ok<T>(res: Response, data: T): void {
  const body: StandardResponse<T> = { success: true, data };
  res.json(body);
}

export function toStringRecord(
  query: ParsedQs,
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}
