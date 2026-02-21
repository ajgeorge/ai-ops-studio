import type { AIProvider, GenerateStructuredInput, GenerateStructuredResult, GenerateTextInput, GenerateTextResult } from "./provider.types.js";

type MockPayloadFactory = (input: Record<string, unknown>) => unknown;

const mockPayloads: Record<string, MockPayloadFactory> = {
  "requirements.analyzeBrief": (input) => ({
    businessDomain: String(input.industry ?? "Internal operations"),
    problemStatement:
      "The current workflow relies on manual coordination, scattered records, and limited visibility into operational status.",
    targetUsers: ["Admin", "Operations manager", "Technician", "Accountant"],
    coreWorkflows: ["Client intake", "Job tracking", "Inventory usage", "Reporting"],
    requirements: [
      {
        title: "Create and track operational jobs",
        description:
          "Users can create work items, assign owners, update status, and review progress from intake to completion.",
        category: "workflow",
        priority: "must_have",
        confidence: "high",
        source: "user_provided"
      },
      {
        title: "Generate management reports",
        description:
          "Managers can review workload, completion trends, delayed items, and revenue-related summaries.",
        category: "reporting",
        priority: "should_have",
        confidence: "medium",
        source: "ai_inferred"
      }
    ],
    clarifyingQuestions: [
      {
        category: "Permissions",
        question: "Which roles can approve discounts, assignments, or final proposal exports?",
        confidence: "medium"
      },
      {
        category: "Notifications",
        question: "Should customer updates be sent through email, SMS, WhatsApp, or kept internal?",
        confidence: "medium"
      }
    ]
  }),
  "operations.explainRecommendation": (input) => ({
    recommendedTechnician: String(input.technicianName ?? "Omar Hassan"),
    confidence: "high",
    score: Number(input.score ?? 91.4),
    reasons: [
      "The technician has the required skill for this service type.",
      "The technician is currently available with no active overload.",
      "The location and SLA window make this assignment the fastest safe option."
    ],
    approvalRequired: true
  }),
  "rag.answerWithContext": (input) => ({
    answer:
      "Urgent roadside jobs should be escalated after 45 minutes if they still have no technician assignment.",
    citations: [
      {
        chunkId: String(input.chunkId ?? "sample-policy-chunk-1"),
        heading: "Escalation policy",
        quote: "Urgent jobs should be escalated after 45 minutes without assignment."
      }
    ],
    evaluation: {
      faithfulness: 0.95,
      completeness: 0.88,
      citationCoverage: 1
    }
  })
};

export class MockAIProvider implements AIProvider {
  readonly name = "mock" as const;
  private readonly model = "mock-ai-ops-v1";

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    const payload = this.buildPayload(input.promptKey, input.input);

    return {
      text: JSON.stringify(payload, null, 2),
      model: this.model,
      tokenUsage: this.estimateTokenUsage(input.prompt, payload)
    };
  }

  async generateStructured<T>(
    input: GenerateStructuredInput<T>
  ): Promise<GenerateStructuredResult<T>> {
    const payload = this.buildPayload(input.promptKey, input.input);
    const data = input.schema.parse(payload);

    return {
      data,
      model: this.model,
      tokenUsage: this.estimateTokenUsage(input.prompt, payload)
    };
  }

  private buildPayload(promptKey: string, input: Record<string, unknown>) {
    const factory = mockPayloads[promptKey];

    if (!factory) {
      return {
        summary: "Mock provider response",
        promptKey,
        input
      };
    }

    return factory(input);
  }

  private estimateTokenUsage(prompt: string, payload: unknown) {
    const promptTokens = Math.max(1, Math.ceil(prompt.length / 4));
    const completionTokens = Math.max(1, Math.ceil(JSON.stringify(payload).length / 4));

    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens
    };
  }
}
