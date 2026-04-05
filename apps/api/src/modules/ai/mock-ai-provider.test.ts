import { MockAIProvider } from "./mock-ai-provider.js";
import {
  operationsRecommendationExplanationSchema,
  ragAnswerSchema,
  requirementAnalysisSchema
} from "./workflow-schemas.js";

describe("MockAIProvider", () => {
  it("returns structured requirements analysis output", async () => {
    const provider = new MockAIProvider();

    const result = await provider.generateStructured({
      prompt: "Analyze a brief",
      promptKey: "requirements.analyzeBrief",
      input: {
        industry: "Garage operations"
      },
      schema: requirementAnalysisSchema
    });

    expect(result.model).toBe("mock-ai-ops-v1");
    expect(result.data.businessDomain).toBe("Garage operations");
    expect(result.data.requirements).toHaveLength(2);
    expect(result.data.clarifyingQuestions[0]?.category).toBe("Permissions");
  });

  it("returns deterministic operations recommendation explanations", async () => {
    const provider = new MockAIProvider();

    const result = await provider.generateStructured({
      prompt: "Explain a recommendation",
      promptKey: "operations.explainRecommendation",
      input: {
        technicianName: "Omar Hassan",
        score: 91.4
      },
      schema: operationsRecommendationExplanationSchema
    });

    expect(result.data).toMatchObject({
      recommendedTechnician: "Omar Hassan",
      confidence: "high",
      approvalRequired: true
    });
  });

  it("returns cited RAG answers for seeded policy questions", async () => {
    const provider = new MockAIProvider();

    const result = await provider.generateStructured({
      prompt: "Answer with context",
      promptKey: "rag.answerWithContext",
      input: {
        contextChunks: [
          {
            id: "chunk_1",
            heading: "Escalation policy",
            content: "Urgent jobs should be escalated after 45 minutes without assignment."
          }
        ]
      },
      schema: ragAnswerSchema
    });

    expect(result.data.citations[0]).toMatchObject({
      chunkId: "chunk_1",
      heading: "Escalation policy"
    });
    expect(result.data.evaluation.citationCoverage).toBe(1);
  });
});
