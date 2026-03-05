import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { aiRouter } from "./routes/ai.js";
import { auditLogsRouter } from "./routes/audit-logs.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { healthRouter } from "./routes/health.js";
import { requirementsRouter } from "./routes/requirements.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.APP_URL,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "test" ? "tiny" : "dev"));

  app.use("/api/health", healthRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/audit-logs", auditLogsRouter);
  app.use("/api/requirements", requirementsRouter);

  app.use((request, response) => {
    response.status(404).json({
      error: {
        message: "Route not found",
        path: request.originalUrl
      }
    });
  });

  app.use(errorHandler);

  return app;
}
