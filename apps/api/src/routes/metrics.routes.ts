import { Router } from "express";
import { listMetrics } from "../controllers/metrics.controller";

const router = Router();

router.get("/", listMetrics);

export default router;
