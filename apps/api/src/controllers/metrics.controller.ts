import type { Request, Response, NextFunction } from "express";
import { getMetrics } from "../services/metrics.service";
import { ok, toStringRecord } from "../utils/response";

export async function listMetrics(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getMetrics(toStringRecord(req.query));
    ok(res, data);
  } catch (err) {
    next(err);
  }
}
