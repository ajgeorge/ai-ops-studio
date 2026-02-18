import { dashboardSummarySchema } from "@ai-ops-studio/shared";
import { Router } from "express";

import { getDashboardSummary } from "../modules/dashboard/dashboard.service.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (_request, response, next) => {
  try {
    const summary = await getDashboardSummary();
    response.json(dashboardSummarySchema.parse(summary));
  } catch (error) {
    next(error);
  }
});
