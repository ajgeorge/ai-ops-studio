import { AppModule } from "@prisma/client";

export type PromptVersionRecord = {
  id: string | null;
  key: string;
  version: number;
  module: AppModule;
  title: string;
  template: string;
  source: "database" | "default";
};

export const defaultPromptVersions: PromptVersionRecord[] = [
  {
    id: null,
    key: "requirements.analyzeBrief",
    version: 1,
    module: AppModule.REQUIREMENTS,
    title: "Analyze client brief",
    template:
      "Extract known requirements, missing information, confidence levels, and workflow assumptions from a client brief.",
    source: "default"
  },
  {
    id: null,
    key: "operations.explainRecommendation",
    version: 1,
    module: AppModule.OPERATIONS,
    title: "Explain technician recommendation",
    template:
      "Explain a deterministic technician assignment recommendation using skill match, availability, distance, workload, and SLA risk.",
    source: "default"
  },
  {
    id: null,
    key: "rag.answerWithContext",
    version: 1,
    module: AppModule.RAG,
    title: "Answer with retrieved context",
    template:
      "Answer a user question using only retrieved document chunks, include citations, and state uncertainty when context is insufficient.",
    source: "default"
  }
];

export function getDefaultPromptVersion(promptKey: string) {
  return defaultPromptVersions.find((prompt) => prompt.key === promptKey);
}
