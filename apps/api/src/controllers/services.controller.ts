import type { Request, Response, NextFunction } from "express";
import { getServices } from "../services/services.service";
import { ok, toStringRecord } from "../utils/response";

export async function listServices(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getServices(toStringRecord(req.query));
    ok(res, data);
  } catch (err) {
    next(err);
  }
}
