import { z } from "zod";

export const requirementAnalysisSchema = z.object({
  businessDomain: z.string(),
  problemStatement: z.string(),
  targetUsers: z.array(z.string()),
  coreWorkflows: z.array(z.string()),
  requirements: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.enum([
        "workflow",
        "reporting",
        "payments",
        "inventory",
        "notifications",
        "integration",
        "security",
        "other"
      ]),
      priority: z.enum(["must_have", "should_have", "could_have"]),
      confidence: z.enum(["high", "medium", "low"]),
      source: z.enum(["user_provided", "ai_inferred"])
    })
  ),
  clarifyingQuestions: z.array(
    z.object({
      category: z.string(),
      question: z.string(),
      confidence: z.enum(["high", "medium", "low"])
    })
  )
});

export const operationsRecommendationExplanationSchema = z.object({
  recommendedTechnician: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  score: z.number(),
  reasons: z.array(z.string()),
  approvalRequired: z.literal(true)
});

export const ragAnswerSchema = z.object({
  answer: z.string(),
  citations: z.array(
    z.object({
      chunkId: z.string(),
      heading: z.string(),
      quote: z.string()
    })
  ),
  evaluation: z.object({
    faithfulness: z.number(),
    completeness: z.number(),
    citationCoverage: z.number()
  })
});

export type RequirementAnalysis = z.infer<typeof requirementAnalysisSchema>;
export type OperationsRecommendationExplanation = z.infer<
  typeof operationsRecommendationExplanationSchema
>;
export type RagAnswer = z.infer<typeof ragAnswerSchema>;
