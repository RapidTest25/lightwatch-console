import { Router } from "express";
import { listServices } from "../controllers/services.controller";

const router = Router();

router.get("/", listServices);

export default router;
