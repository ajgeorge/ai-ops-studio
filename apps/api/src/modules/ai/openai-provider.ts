import type { AIProvider, GenerateStructuredInput, GenerateStructuredResult, GenerateTextInput, GenerateTextResult } from "./provider.types.js";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai" as const;

  async generateText(_input: GenerateTextInput): Promise<GenerateTextResult> {
    throw new Error(
      "OpenAIProvider is not wired yet. Use AI_PROVIDER=mock until the OpenAI-compatible provider slice is implemented."
    );
  }

  async generateStructured<T>(_input: GenerateStructuredInput<T>): Promise<GenerateStructuredResult<T>> {
    throw new Error(
      "OpenAIProvider is not wired yet. Use AI_PROVIDER=mock until the OpenAI-compatible provider slice is implemented."
    );
  }
}
