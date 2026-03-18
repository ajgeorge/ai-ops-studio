import {
  ConfidenceLevel,
  GeneratedSource,
  QuestionStatus,
  RequirementCategory,
  RequirementPriority
} from "@prisma/client";

import {
  buildRequirementArtifacts,
  mapRequirementAnalysisToPersistence
} from "./requirements.service.js";

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

describe("buildRequirementArtifacts", () => {
  it("builds proposal-ready planning artifacts from project data", () => {
    const artifacts = buildRequirementArtifacts({
      id: "project_1",
      name: "Garage Management System",
      industry: "Automotive services",
      brief: {
        rawBrief: "Garage needs jobs, customers, vehicles, inventory, payments, and reports.",
        businessDescription: "Garage operations platform",
        requiredModules: ["Jobs", "Customers", "Inventory"],
        knownUsers: ["Admin", "Technician"]
      },
      requirements: [
        {
          title: "Track jobs",
          description: "Track work from intake to completion.",
          priority: RequirementPriority.MUST_HAVE,
          category: RequirementCategory.WORKFLOW
        }
      ],
      clarifyingQuestions: [
        {
          question: "Who can approve discounts?",
          category: "Permissions"
        }
      ]
    });

    expect(artifacts.features.some((feature) => feature.bucket === "MVP")).toBe(true);
    expect(artifacts.userStories[0]).toMatchObject({
      role: "Admin",
      priority: RequirementPriority.MUST_HAVE
    });
    expect(artifacts.dataEntities.map((entity) => entity.name)).toContain("Requirement");
    expect(artifacts.apiRoutes.map((route) => route.path)).toContain(
      "/api/requirements/projects/:id/export/markdown"
    );
    expect(artifacts.proposal.markdown).toContain("# Garage Management System Proposal");
  });
});
