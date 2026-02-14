import type { Request, Response, NextFunction } from "express";

export function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  _res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${_res.statusCode} ${duration}ms`,
    );
  });
  next();
}
