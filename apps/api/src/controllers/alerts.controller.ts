import type { Request, Response, NextFunction } from "express";
import { getAlerts, createAlert } from "../services/alerts.service";
import { ok, toStringRecord } from "../utils/response";

export async function listAlerts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getAlerts(toStringRecord(req.query));
    ok(res, data);
  } catch (err) {
    next(err);
  }
}

export async function addAlert(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await createAlert(req.body);
    ok(res, data);
  } catch (err) {
    next(err);
  }
}
