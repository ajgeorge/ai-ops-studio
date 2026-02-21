import { env } from "../../config/env.js";
import { MockAIProvider } from "./mock-ai-provider.js";
import { OpenAIProvider } from "./openai-provider.js";
import type { AIProvider } from "./provider.types.js";

export function createAIProvider(providerName = env.AI_PROVIDER): AIProvider {
  if (providerName === "openai") {
    return new OpenAIProvider();
  }

  return new MockAIProvider();
}
