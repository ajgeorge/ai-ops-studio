import { opsDashboardResponseSchema, opsRecommendationSchema } from "@ai-ops-studio/shared";
import { Router } from "express";

import {
  approveRecommendation,
  getOpsDashboard,
  OpsEntityNotFoundError,
  OpsInvalidActionError,
  recommendTechnicianForJob,
  rejectRecommendation
} from "../modules/operations/operations.service.js";

export const operationsRouter = Router();

function handleOpsError(error: unknown, response: import("express").Response) {
  if (error instanceof OpsEntityNotFoundError) {
    response.status(404).json({ error: { message: error.message } });
    return true;
  }

  if (error instanceof OpsInvalidActionError) {
    response.status(409).json({ error: { message: error.message } });
    return true;
  }

  return false;
}

operationsRouter.get("/dashboard", async (_request, response, next) => {
  try {
    const dashboard = await getOpsDashboard();
    response.json(opsDashboardResponseSchema.parse(dashboard));
  } catch (error) {
    next(error);
  }
});

operationsRouter.post("/jobs/:jobId/recommend", async (request, response, next) => {
  try {
    const recommendation = await recommendTechnicianForJob(request.params.jobId);
    response.status(201).json(opsRecommendationSchema.parse(recommendation));
  } catch (error) {
    if (handleOpsError(error, response)) {
      return;
    }

    next(error);
  }
});

operationsRouter.post("/recommendations/:recommendationId/approve", async (request, response, next) => {
  try {
    const recommendation = await approveRecommendation(request.params.recommendationId);
    response.json(opsRecommendationSchema.parse(recommendation));
  } catch (error) {
    if (handleOpsError(error, response)) {
      return;
    }

    next(error);
  }
});

operationsRouter.post("/recommendations/:recommendationId/reject", async (request, response, next) => {
  try {
    const recommendation = await rejectRecommendation(request.params.recommendationId);
    response.json(opsRecommendationSchema.parse(recommendation));
  } catch (error) {
    if (handleOpsError(error, response)) {
      return;
    }

    next(error);
  }
});
