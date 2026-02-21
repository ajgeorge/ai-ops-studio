import { AIRunStatus, AppModule } from "@prisma/client";
import type { AiDemoRunResponse, AiDemoWorkflow } from "@ai-ops-studio/shared";
import { ZodError, type ZodTypeAny } from "zod";

import { createAIProvider } from "./provider-factory.js";
import type { AIProvider } from "./provider.types.js";
import { prismaAIRunLogger, type AIRunLogger } from "./ai-run-logger.js";
import { getActivePromptVersion, type PromptRegistryResult } from "./prompt-registry.js";
import {
  operationsRecommendationExplanationSchema,
  ragAnswerSchema,
  requirementAnalysisSchema
} from "./workflow-schemas.js";

type WorkflowConfig = {
  module: AppModule;
  workflow: string;
  step: string;
  promptKey: AiDemoWorkflow;
  schema: ZodTypeAny;
};

const workflowConfigs: Record<AiDemoWorkflow, WorkflowConfig> = {
  "requirements.analyzeBrief": {
    module: AppModule.REQUIREMENTS,
    workflow: "AnalyzeBriefWorkflow",
    step: "analyzeBrief",
    promptKey: "requirements.analyzeBrief",
    schema: requirementAnalysisSchema
  },
  "operations.explainRecommendation": {
    module: AppModule.OPERATIONS,
    workflow: "RecommendTechnicianWorkflow",
    step: "explainRecommendation",
    promptKey: "operations.explainRecommendation",
    schema: operationsRecommendationExplanationSchema
  },
  "rag.answerWithContext": {
    module: AppModule.RAG,
    workflow: "RagAnswerWorkflow",
    step: "answerWithContext",
    promptKey: "rag.answerWithContext",
    schema: ragAnswerSchema
  }
};

type AIWorkflowDependencies = {
  provider?: AIProvider;
  logger?: AIRunLogger;
  getPrompt?: (promptKey: string) => Promise<PromptRegistryResult>;
};

function mergeWarnings(...warnings: Array<string | undefined>) {
  return warnings.filter(Boolean).join(" ");
}

export async function runDemoAIWorkflow(
  workflow: AiDemoWorkflow,
  input: Record<string, unknown>,
  dependencies: AIWorkflowDependencies = {}
): Promise<AiDemoRunResponse> {
  const config = workflowConfigs[workflow];
  const provider = dependencies.provider ?? createAIProvider();
  const logger = dependencies.logger ?? prismaAIRunLogger;
  const getPrompt = dependencies.getPrompt ?? getActivePromptVersion;
  const { prompt, warning: promptWarning } = await getPrompt(config.promptKey);
  const startedAt = Date.now();
  const { runId, warning: startWarning } = await logger.start({
    module: config.module,
    workflow: config.workflow,
    step: config.step,
    provider: provider.name,
    promptVersion: prompt,
    input
  });

  try {
    const result = await provider.generateStructured({
      prompt: prompt.template,
      promptKey: config.promptKey,
      input,
      schema: config.schema
    });
    const latencyMs = Date.now() - startedAt;
    const { warning: completeWarning } = await logger.complete({
      runId,
      output: result.data,
      status: AIRunStatus.SUCCEEDED,
      latencyMs,
      model: result.model,
      tokenUsage: result.tokenUsage
    });

    return {
      runId,
      status: "succeeded",
      provider: provider.name,
      promptVersion: {
        key: prompt.key,
        version: prompt.version,
        title: prompt.title,
        source: prompt.source
      },
      output: result.data,
      latencyMs,
      warning: mergeWarnings(promptWarning, startWarning, completeWarning) || undefined
    };
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const status = error instanceof ZodError ? AIRunStatus.VALIDATION_FAILED : AIRunStatus.FAILED;
    const { warning: completeWarning } = await logger.complete({
      runId,
      status,
      latencyMs,
      validationErrors: error instanceof ZodError ? error.issues : undefined
    });

    return {
      runId,
      status: error instanceof ZodError ? "validation_failed" : "failed",
      provider: provider.name,
      promptVersion: {
        key: prompt.key,
        version: prompt.version,
        title: prompt.title,
        source: prompt.source
      },
      output: {
        message: error instanceof Error ? error.message : "AI workflow failed"
      },
      latencyMs,
      warning: mergeWarnings(promptWarning, startWarning, completeWarning) || undefined
    };
  }
}
