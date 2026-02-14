import type { Request, Response, NextFunction } from "express";
import { getSecurityEvents } from "../services/security.service";
import { ok, toStringRecord } from "../utils/response";

export async function listSecurityEvents(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getSecurityEvents(toStringRecord(req.query));
    ok(res, data);
  } catch (err) {
    next(err);
  }
}
