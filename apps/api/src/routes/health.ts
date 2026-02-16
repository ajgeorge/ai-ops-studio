import { Router } from "express";
import { APP_MODULES, healthResponseSchema } from "@ai-ops-studio/shared";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  const payload = healthResponseSchema.parse({
    status: "ok",
    service: "ai-ops-studio-api",
    version: process.env.npm_package_version ?? "0.1.0",
    timestamp: new Date().toISOString(),
    modules: APP_MODULES
  });

  response.json(payload);
});
