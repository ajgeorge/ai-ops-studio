import type { z } from "zod";

export type GenerateTextInput = {
  prompt: string;
  promptKey: string;
  input: Record<string, unknown>;
};

export type GenerateTextResult = {
  text: string;
  model: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export type GenerateStructuredInput<T> = GenerateTextInput & {
  schema: z.ZodType<T>;
};

export type GenerateStructuredResult<T> = {
  data: T;
  model: string;
  tokenUsage?: GenerateTextResult["tokenUsage"];
};

export interface AIProvider {
  readonly name: "mock" | "openai";
  generateText(input: GenerateTextInput): Promise<GenerateTextResult>;
  generateStructured<T>(input: GenerateStructuredInput<T>): Promise<GenerateStructuredResult<T>>;
}
