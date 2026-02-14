import express from "express";
import cors from "cors";
import v1Router from "./routes";
import authRouter from "./routes/auth.routes";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";
import { requireAuth } from "./middleware/require-auth";

export function createApp(): express.Application {
  const app = express();

  // ─── Global middleware ───────────────────────────────────────────
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(requestLogger);

  // ─── Health check (public) ───────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // ─── Auth routes (public) ───────────────────────────────────────
  app.use("/auth", authRouter);

  // ─── Session guard (all routes below require auth) ──────────────
  app.use(requireAuth);

  // ─── API routes (protected) ─────────────────────────────────────
  app.use("/v1", v1Router);

  // ─── Centralized error handler (must be last) ────────────────────
  app.use(errorHandler);

  return app;
}
