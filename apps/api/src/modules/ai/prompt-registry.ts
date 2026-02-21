import { PromptStatus } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import { getDefaultPromptVersion, type PromptVersionRecord } from "./default-prompts.js";

export type PromptRegistryResult = {
  prompt: PromptVersionRecord;
  warning?: string;
};

export async function getActivePromptVersion(promptKey: string): Promise<PromptRegistryResult> {
  try {
    const prompt = await prisma.promptVersion.findFirst({
      where: {
        key: promptKey,
        status: PromptStatus.ACTIVE
      },
      orderBy: {
        version: "desc"
      }
    });

    if (prompt) {
      return {
        prompt: {
          id: prompt.id,
          key: prompt.key,
          version: prompt.version,
          module: prompt.module,
          title: prompt.title,
          template: prompt.template,
          source: "database"
        }
      };
    }
  } catch (error) {
    const fallback = getDefaultPromptVersion(promptKey);

    if (fallback) {
      return {
        prompt: fallback,
        warning: `Using default prompt because the prompt registry could not be read: ${
          error instanceof Error ? error.message : "unknown error"
        }`
      };
    }

    throw error;
  }

  const fallback = getDefaultPromptVersion(promptKey);

  if (!fallback) {
    throw new Error(`No active or default prompt found for key: ${promptKey}`);
  }

  return {
    prompt: fallback,
    warning: `Using default prompt because no active prompt version exists for key: ${promptKey}`
  };
}
