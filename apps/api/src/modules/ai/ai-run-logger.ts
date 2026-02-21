import { AIProviderName, AIRunStatus, type AppModule, Prisma } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import type { PromptVersionRecord } from "./default-prompts.js";

type StartAIRunInput = {
  module: AppModule;
  workflow: string;
  step: string;
  provider: "mock" | "openai";
  promptVersion: PromptVersionRecord;
  input: Record<string, unknown>;
};

type CompleteAIRunInput = {
  runId: string | null;
  output?: unknown;
  status: AIRunStatus;
  latencyMs: number;
  model?: string;
  tokenUsage?: unknown;
  validationErrors?: unknown;
};

export type AIRunLogger = {
  start(input: StartAIRunInput): Promise<{ runId: string | null; warning?: string }>;
  complete(input: CompleteAIRunInput): Promise<{ warning?: string }>;
};

function providerName(provider: "mock" | "openai") {
  return provider === "openai" ? AIProviderName.OPENAI : AIProviderName.MOCK;
}

export const prismaAIRunLogger: AIRunLogger = {
  async start(input) {
    try {
      const run = await prisma.aIRun.create({
        data: {
          module: input.module,
          workflow: input.workflow,
          step: input.step,
          provider: providerName(input.provider),
          promptVersionId:
            input.promptVersion.source === "database" ? input.promptVersion.id : undefined,
          status: AIRunStatus.RUNNING,
          input: input.input as Prisma.InputJsonValue
        }
      });

      return { runId: run.id };
    } catch (error) {
      return {
        runId: null,
        warning: `AI run was not persisted: ${
          error instanceof Error ? error.message : "unknown error"
        }`
      };
    }
  },

  async complete(input) {
    if (!input.runId) {
      return {};
    }

    try {
      await prisma.aIRun.update({
        where: {
          id: input.runId
        },
        data: {
          status: input.status,
          output:
            input.output === undefined ? undefined : (input.output as Prisma.InputJsonValue),
          validationErrors:
            input.validationErrors === undefined
              ? undefined
              : (input.validationErrors as Prisma.InputJsonValue),
          latencyMs: input.latencyMs,
          model: input.model,
          tokenUsage:
            input.tokenUsage === undefined ? undefined : (input.tokenUsage as Prisma.InputJsonValue),
          completedAt: new Date()
        }
      });

      return {};
    } catch (error) {
      return {
        warning: `AI run completion was not persisted: ${
          error instanceof Error ? error.message : "unknown error"
        }`
      };
    }
  }
};
