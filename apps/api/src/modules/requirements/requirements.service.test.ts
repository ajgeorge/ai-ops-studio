import {
  ConfidenceLevel,
  GeneratedSource,
  QuestionStatus,
  RequirementCategory,
  RequirementPriority
} from "@prisma/client";

import { mapRequirementAnalysisToPersistence } from "./requirements.service.js";

describe("mapRequirementAnalysisToPersistence", () => {
  it("maps structured AI output into Prisma enum values", () => {
    const result = mapRequirementAnalysisToPersistence({
      businessDomain: "Garage operations",
      problemStatement: "Manual job tracking causes delays.",
      targetUsers: ["Admin"],
      coreWorkflows: ["Job intake"],
      requirements: [
        {
          title: "Track jobs",
          description: "Admins can track jobs from intake to completion.",
          category: "workflow",
          priority: "must_have",
          confidence: "high",
          source: "ai_inferred"
        }
      ],
      clarifyingQuestions: [
        {
          category: "Workflow",
          question: "Can one job move between departments?",
          confidence: "medium"
        }
      ]
    });

    expect(result.requirements[0]).toMatchObject({
      category: RequirementCategory.WORKFLOW,
      priority: RequirementPriority.MUST_HAVE,
      confidence: ConfidenceLevel.HIGH,
      source: GeneratedSource.AI_INFERRED
    });
    expect(result.clarifyingQuestions[0]).toMatchObject({
      status: QuestionStatus.UNANSWERED,
      confidence: ConfidenceLevel.MEDIUM
    });
  });
});
