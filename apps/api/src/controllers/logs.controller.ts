import type { Request, Response, NextFunction } from "express";
import { getLogs } from "../services/logs.service";
import { ok, toStringRecord } from "../utils/response";

export async function listLogs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getLogs(toStringRecord(req.query));
    ok(res, data);
  } catch (err) {
    next(err);
  }
}
