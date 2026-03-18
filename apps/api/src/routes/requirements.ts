import {
  analyzeRequirementProjectResponseSchema,
  createRequirementProjectRequestSchema,
  generateRequirementArtifactsResponseSchema,
  markdownExportResponseSchema,
  requirementProjectDetailSchema,
  requirementProjectListItemSchema
} from "@ai-ops-studio/shared";
import { Router } from "express";

import {
  analyzeRequirementProject,
  createRequirementProject,
  exportRequirementProposalMarkdown,
  generateRequirementArtifacts,
  getRequirementProject,
  listRequirementProjects,
  RequirementProjectNotFoundError
} from "../modules/requirements/requirements.service.js";

export const requirementsRouter = Router();

requirementsRouter.get("/projects", async (_request, response, next) => {
  try {
    const projects = await listRequirementProjects();
    response.json(requirementProjectListItemSchema.array().parse(projects));
  } catch (error) {
    next(error);
  }
});

requirementsRouter.post("/projects", async (request, response, next) => {
  try {
    const payload = createRequirementProjectRequestSchema.parse(request.body);
    const project = await createRequirementProject(payload);
    response.status(201).json(requirementProjectDetailSchema.parse(project));
  } catch (error) {
    next(error);
  }
});

requirementsRouter.get("/projects/:projectId", async (request, response, next) => {
  try {
    const project = await getRequirementProject(request.params.projectId);
    response.json(requirementProjectDetailSchema.parse(project));
  } catch (error) {
    if (error instanceof RequirementProjectNotFoundError) {
      response.status(404).json({
        error: {
          message: error.message
        }
      });
      return;
    }

    next(error);
  }
});

requirementsRouter.post("/projects/:projectId/analyze", async (request, response, next) => {
  try {
    const result = await analyzeRequirementProject(request.params.projectId);
    response.status(201).json(analyzeRequirementProjectResponseSchema.parse(result));
  } catch (error) {
    if (error instanceof RequirementProjectNotFoundError) {
      response.status(404).json({
        error: {
          message: error.message
        }
      });
      return;
    }

    next(error);
  }
});

requirementsRouter.post("/projects/:projectId/generate-artifacts", async (request, response, next) => {
  try {
    const result = await generateRequirementArtifacts(request.params.projectId);
    response.status(201).json(generateRequirementArtifactsResponseSchema.parse(result));
  } catch (error) {
    if (error instanceof RequirementProjectNotFoundError) {
      response.status(404).json({
        error: {
          message: error.message
        }
      });
      return;
    }

    next(error);
  }
});

requirementsRouter.get("/projects/:projectId/export/markdown", async (request, response, next) => {
  try {
    const result = await exportRequirementProposalMarkdown(request.params.projectId);
    response.json(markdownExportResponseSchema.parse(result));
  } catch (error) {
    if (error instanceof RequirementProjectNotFoundError) {
      response.status(404).json({
        error: {
          message: error.message
        }
      });
      return;
    }

    next(error);
  }
});
