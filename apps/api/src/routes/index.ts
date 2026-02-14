import { Router } from "express";
import servicesRouter from "./services.routes";
import logsRouter from "./logs.routes";
import metricsRouter from "./metrics.routes";
import securityRouter from "./security.routes";
import alertsRouter from "./alerts.routes";

const v1Router = Router();

v1Router.use("/services", servicesRouter);
v1Router.use("/logs", logsRouter);
v1Router.use("/metrics", metricsRouter);
v1Router.use("/security", securityRouter);
v1Router.use("/alerts", alertsRouter);

export default v1Router;
