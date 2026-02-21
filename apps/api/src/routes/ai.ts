import { aiDemoRunRequestSchema, aiDemoRunResponseSchema } from "@ai-ops-studio/shared";
import { Router } from "express";

import { prisma } from "../db/prisma.js";
import { runDemoAIWorkflow } from "../modules/ai/ai-workflow.service.js";

export const aiRouter = Router();

aiRouter.post("/demo-runs", async (request, response, next) => {
  try {
    const payload = aiDemoRunRequestSchema.parse(request.body);
    const result = await runDemoAIWorkflow(payload.workflow, payload.input);

    response.status(result.status === "succeeded" ? 201 : 500).json(aiDemoRunResponseSchema.parse(result));
  } catch (error) {
    next(error);
  }
});

aiRouter.get("/runs", async (_request, response, next) => {
  try {
    const runs = await prisma.aIRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        promptVersion: {
          select: {
            key: true,
            version: true,
            title: true
          }
        }
      }
    });

    response.json(
      runs.map((run) => ({
        ...run,
        createdAt: run.createdAt.toISOString(),
        startedAt: run.startedAt.toISOString(),
        completedAt: run.completedAt?.toISOString() ?? null
      }))
    );
  } catch (error) {
    next(error);
  }
});

aiRouter.get("/prompts", async (_request, response, next) => {
  try {
    const prompts = await prisma.promptVersion.findMany({
      orderBy: [{ key: "asc" }, { version: "desc" }]
    });

    response.json(
      prompts.map((prompt) => ({
        ...prompt,
        createdAt: prompt.createdAt.toISOString(),
        updatedAt: prompt.updatedAt.toISOString()
      }))
    );
  } catch (error) {
    next(error);
  }
});
