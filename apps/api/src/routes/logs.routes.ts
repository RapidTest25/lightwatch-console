import { Router } from "express";
import { listLogs } from "../controllers/logs.controller";

const router = Router();

router.get("/", listLogs);

export default router;
