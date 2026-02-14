import { Router } from "express";
import { listSecurityEvents } from "../controllers/security.controller";

const router = Router();

router.get("/", listSecurityEvents);

export default router;
