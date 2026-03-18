import {
  ConfidenceLevel,
  FeatureBucket,
  GeneratedSource,
  HttpMethod,
  Prisma,
  ProjectStatus,
  QuestionStatus,
  RequirementCategory,
  RequirementPriority,
  UserStoryStatus
} from "@prisma/client";
import type {
  AnalyzeRequirementProjectResponse,
  CreateRequirementProjectRequest,
  GenerateRequirementArtifactsResponse,
  MarkdownExportResponse,
  RequirementProjectDetail,
  RequirementProjectListItem
} from "@ai-ops-studio/shared";

import { prisma } from "../../db/prisma.js";
import { runDemoAIWorkflow } from "../ai/ai-workflow.service.js";
import {
  requirementAnalysisSchema,
  type RequirementAnalysis
} from "../ai/workflow-schemas.js";

export class RequirementProjectNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Requirement project not found: ${projectId}`);
    this.name = "RequirementProjectNotFoundError";
  }
}

const projectDetailInclude = {
  brief: true,
  requirements: {
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }]
  },
  clarifyingQuestions: {
    orderBy: [{ status: "asc" }, { createdAt: "asc" }]
  },
  features: {
    orderBy: [{ bucket: "asc" }, { createdAt: "asc" }]
  },
  userStories: {
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }]
  },
  dataEntities: {
    orderBy: [{ name: "asc" }]
  },
  apiRouteSuggestions: {
    orderBy: [{ method: "asc" }, { path: "asc" }]
  },
  proposals: {
    orderBy: {
      updatedAt: "desc"
    }
  },
  _count: {
    select: {
      requirements: true,
      clarifyingQuestions: {
        where: {
          status: QuestionStatus.UNANSWERED
        }
      }
    }
  }
} satisfies Prisma.RequirementProjectInclude;

type RequirementProjectWithDetail = Prisma.RequirementProjectGetPayload<{
  include: typeof projectDetailInclude;
}>;

const categoryMap: Record<string, RequirementCategory> = {
  user_management: RequirementCategory.USER_MANAGEMENT,
  workflow: RequirementCategory.WORKFLOW,
  reporting: RequirementCategory.REPORTING,
  payments: RequirementCategory.PAYMENTS,
  inventory: RequirementCategory.INVENTORY,
  notifications: RequirementCategory.NOTIFICATIONS,
  integration: RequirementCategory.INTEGRATION,
  security: RequirementCategory.SECURITY,
  other: RequirementCategory.OTHER
};

const priorityMap: Record<string, RequirementPriority> = {
  must_have: RequirementPriority.MUST_HAVE,
  should_have: RequirementPriority.SHOULD_HAVE,
  could_have: RequirementPriority.COULD_HAVE
};

const confidenceMap: Record<string, ConfidenceLevel> = {
  high: ConfidenceLevel.HIGH,
  medium: ConfidenceLevel.MEDIUM,
  low: ConfidenceLevel.LOW
};

const sourceMap: Record<string, GeneratedSource> = {
  user_provided: GeneratedSource.USER_PROVIDED,
  ai_inferred: GeneratedSource.AI_INFERRED
};

export function buildRequirementProjectListItem(
  project: Pick<
    RequirementProjectWithDetail,
    "id" | "name" | "industry" | "status" | "completionPercentage" | "updatedAt" | "_count"
  >
): RequirementProjectListItem {
  return {
    id: project.id,
    name: project.name,
    industry: project.industry,
    status: project.status,
    completionPercentage: project.completionPercentage,
    requirementCount: project._count.requirements,
    unansweredQuestionCount: project._count.clarifyingQuestions,
    updatedAt: project.updatedAt.toISOString()
  };
}

export function buildRequirementProjectDetail(
  project: RequirementProjectWithDetail
): RequirementProjectDetail {
  return {
    ...buildRequirementProjectListItem(project),
    clientType: project.clientType,
    budgetRange: project.budgetRange,
    additionalNotes: project.additionalNotes,
    brief: project.brief
      ? {
          businessDescription: project.brief.businessDescription,
          currentWorkflow: project.brief.currentWorkflow,
          painPoints: project.brief.painPoints,
          requiredModules: project.brief.requiredModules,
          knownUsers: project.brief.knownUsers,
          rawBrief: project.brief.rawBrief
        }
      : null,
    requirements: project.requirements.map((requirement) => ({
      id: requirement.id,
      title: requirement.title,
      description: requirement.description,
      category: requirement.category,
      priority: requirement.priority,
      confidence: requirement.confidence,
      source: requirement.source
    })),
    clarifyingQuestions: project.clarifyingQuestions.map((question) => ({
      id: question.id,
      category: question.category,
      question: question.question,
      answer: question.answer,
      status: question.status,
      confidence: question.confidence
    })),
    features: project.features.map((feature) => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      bucket: feature.bucket
    })),
    userStories: project.userStories.map((story) => ({
      id: story.id,
      title: story.title,
      role: story.role,
      goal: story.goal,
      benefit: story.benefit,
      priority: story.priority,
      relatedFeature: story.relatedFeature,
      status: story.status,
      acceptanceCriteria: story.acceptanceCriteria
    })),
    dataEntities: project.dataEntities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      fields: entity.fields,
      relationships: entity.relationships,
      notes: entity.notes
    })),
    apiRouteSuggestions: project.apiRouteSuggestions.map((route) => ({
      id: route.id,
      method: route.method,
      path: route.path,
      purpose: route.purpose,
      requestBody: route.requestBody,
      responseShape: route.responseShape,
      permission: route.permission,
      relatedDataModel: route.relatedDataModel
    })),
    proposals: project.proposals.map((proposal) => ({
      id: proposal.id,
      title: proposal.title,
      markdown: proposal.markdown,
      createdAt: proposal.createdAt.toISOString(),
      updatedAt: proposal.updatedAt.toISOString()
    }))
  };
}

export function mapRequirementAnalysisToPersistence(analysis: RequirementAnalysis) {
  return {
    requirements: analysis.requirements.map((requirement) => ({
      title: requirement.title,
      description: requirement.description,
      category: categoryMap[requirement.category] ?? RequirementCategory.OTHER,
      priority: priorityMap[requirement.priority] ?? RequirementPriority.SHOULD_HAVE,
      confidence: confidenceMap[requirement.confidence] ?? ConfidenceLevel.MEDIUM,
      source: sourceMap[requirement.source] ?? GeneratedSource.AI_INFERRED
    })),
    clarifyingQuestions: analysis.clarifyingQuestions.map((question) => ({
      category: question.category,
      question: question.question,
      confidence: confidenceMap[question.confidence] ?? ConfidenceLevel.MEDIUM,
      status: QuestionStatus.UNANSWERED
    }))
  };
}

export async function listRequirementProjects() {
  const projects = await prisma.requirementProject.findMany({
    orderBy: {
      updatedAt: "desc"
    },
    include: projectDetailInclude
  });

  return projects.map(buildRequirementProjectListItem);
}

export async function createRequirementProject(input: CreateRequirementProjectRequest) {
  const project = await prisma.requirementProject.create({
    data: {
      name: input.name,
      industry: input.industry,
      clientType: input.clientType,
      status: ProjectStatus.DRAFT,
      completionPercentage: 15,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      budgetRange: input.budgetRange,
      additionalNotes: input.additionalNotes,
      brief: {
        create: {
          businessDescription: input.businessDescription,
          currentWorkflow: input.currentWorkflow,
          painPoints: input.painPoints,
          requiredModules: input.requiredModules,
          knownUsers: input.knownUsers,
          rawBrief: input.rawBrief
        }
      }
    },
    include: projectDetailInclude
  });

  await prisma.auditLog.create({
    data: {
      action: "requirements.project.created",
      module: "REQUIREMENTS",
      entityType: "RequirementProject",
      entityId: project.id,
      metadata: {
        name: project.name,
        industry: project.industry
      }
    }
  });

  return buildRequirementProjectDetail(project);
}

export async function getRequirementProject(projectId: string) {
  const project = await prisma.requirementProject.findUnique({
    where: {
      id: projectId
    },
    include: projectDetailInclude
  });

  if (!project) {
    throw new RequirementProjectNotFoundError(projectId);
  }

  return buildRequirementProjectDetail(project);
}

export async function analyzeRequirementProject(
  projectId: string
): Promise<AnalyzeRequirementProjectResponse> {
  const project = await prisma.requirementProject.findUnique({
    where: {
      id: projectId
    },
    include: {
      brief: true
    }
  });

  if (!project) {
    throw new RequirementProjectNotFoundError(projectId);
  }

  const aiRun = await runDemoAIWorkflow("requirements.analyzeBrief", {
    projectId: project.id,
    projectName: project.name,
    industry: project.industry,
    brief: project.brief?.rawBrief ?? "",
    businessDescription: project.brief?.businessDescription ?? ""
  });
  const analysis = requirementAnalysisSchema.parse(aiRun.output);
  const mapped = mapRequirementAnalysisToPersistence(analysis);

  await prisma.$transaction([
    prisma.requirement.deleteMany({
      where: {
        projectId,
        source: GeneratedSource.AI_INFERRED
      }
    }),
    prisma.clarifyingQuestion.deleteMany({
      where: {
        projectId,
        status: QuestionStatus.UNANSWERED
      }
    }),
    prisma.requirement.createMany({
      data: mapped.requirements.map((requirement) => ({
        ...requirement,
        projectId
      }))
    }),
    prisma.clarifyingQuestion.createMany({
      data: mapped.clarifyingQuestions.map((question) => ({
        ...question,
        projectId
      }))
    }),
    prisma.requirementProject.update({
      where: {
        id: projectId
      },
      data: {
        status: ProjectStatus.NEEDS_CLARIFICATION,
        completionPercentage: 35
      }
    }),
    prisma.auditLog.create({
      data: {
        action: "requirements.project.analyzed",
        module: "REQUIREMENTS",
        entityType: "RequirementProject",
        entityId: projectId,
        metadata: {
          aiRunId: aiRun.runId,
          generatedRequirements: mapped.requirements.length,
          generatedQuestions: mapped.clarifyingQuestions.length
        }
      }
    })
  ]);

  return {
    project: await getRequirementProject(projectId),
    aiRun,
    generated: {
      requirements: mapped.requirements.length,
      clarifyingQuestions: mapped.clarifyingQuestions.length
    }
  };
}

type ArtifactProjectInput = {
  id: string;
  name: string;
  industry: string;
  brief: {
    rawBrief: string;
    businessDescription: string;
    requiredModules: string[];
    knownUsers: string[];
  } | null;
  requirements: Array<{
    title: string;
    description: string;
    priority: RequirementPriority;
    category: RequirementCategory;
  }>;
  clarifyingQuestions: Array<{
    question: string;
    category: string;
  }>;
};

function titleForModule(moduleName: string) {
  return moduleName.trim().replace(/\s+/g, " ");
}

export function buildRequirementArtifacts(project: ArtifactProjectInput) {
  const modules = project.brief?.requiredModules.length
    ? project.brief.requiredModules.map(titleForModule)
    : ["Jobs", "Customers", "Reporting"];
  const users = project.brief?.knownUsers.length
    ? project.brief.knownUsers
    : ["Admin", "Manager", "Staff"];
  const primaryRole = users[0] ?? "Admin";
  const secondaryRole = users[1] ?? "Manager";
  const proposalMarkdown = [
    `# ${project.name} Proposal`,
    "",
    "## Executive Summary",
    `${project.name} is a proposed internal platform for ${project.industry.toLowerCase()} workflows. The MVP focuses on operational visibility, structured records, and controlled AI-assisted planning.`,
    "",
    "## MVP Scope",
    ...modules.slice(0, 5).map((moduleName) => `- ${moduleName} management`),
    "",
    "## Key Requirements",
    ...project.requirements.slice(0, 8).map((requirement) => `- ${requirement.title}`),
    "",
    "## Clarifying Questions",
    ...project.clarifyingQuestions.slice(0, 6).map((question) => `- ${question.question}`),
    "",
    "## Recommended Architecture",
    "- React dashboard for workflow screens",
    "- Express API with structured validation",
    "- PostgreSQL persistence with audit logs",
    "- Mock-first AI provider abstraction",
    "",
    "## Next Steps",
    "- Confirm workflow rules and role permissions",
    "- Review MVP scope with stakeholders",
    "- Convert accepted requirements into implementation tickets"
  ].join("\n");

  return {
    features: [
      ...modules.slice(0, 5).map((moduleName) => ({
        title: `${moduleName} management`,
        description: `Core workflow support for ${moduleName.toLowerCase()} records and operational visibility.`,
        bucket: FeatureBucket.MVP
      })),
      {
        title: "Advanced notifications",
        description: "Send customer and staff updates through preferred communication channels.",
        bucket: FeatureBucket.FUTURE
      },
      {
        title: "External accounting sync",
        description: "Integrate invoices and payments with a third-party accounting system.",
        bucket: FeatureBucket.FUTURE
      },
      {
        title: "Public customer mobile app",
        description: "Deferred until internal workflows are validated.",
        bucket: FeatureBucket.OUT_OF_SCOPE
      }
    ],
    userStories: [
      {
        title: "Create a tracked work item",
        role: primaryRole,
        goal: "create a structured work item from a client request",
        benefit: "the team can track work from intake to completion",
        priority: RequirementPriority.MUST_HAVE,
        relatedFeature: `${modules[0]} management`,
        status: UserStoryStatus.DRAFT,
        acceptanceCriteria: [
          "User can enter required work item details",
          "System saves the item with an initial status",
          "System records who created the item"
        ]
      },
      {
        title: "Review outstanding clarifications",
        role: secondaryRole,
        goal: "review AI-generated questions before scope is finalized",
        benefit: "the proposal reflects real business rules",
        priority: RequirementPriority.SHOULD_HAVE,
        relatedFeature: "Requirements review",
        status: UserStoryStatus.DRAFT,
        acceptanceCriteria: [
          "Questions are grouped by business category",
          "User can answer or defer each question",
          "Answered questions remain linked to the project"
        ]
      },
      {
        title: "Export a proposal draft",
        role: primaryRole,
        goal: "export the generated scope and assumptions",
        benefit: "stakeholders can review a clear project proposal",
        priority: RequirementPriority.SHOULD_HAVE,
        relatedFeature: "Proposal generation",
        status: UserStoryStatus.DRAFT,
        acceptanceCriteria: [
          "Proposal includes MVP scope",
          "Proposal includes assumptions and open questions",
          "Exported markdown is generated from saved project data"
        ]
      }
    ],
    dataEntities: [
      {
        name: "Project",
        fields: {
          id: "string",
          name: "string",
          industry: "string",
          status: "enum",
          completionPercentage: "number"
        },
        relationships: {
          brief: "one-to-one",
          requirements: "one-to-many",
          proposals: "one-to-many"
        },
        notes: "Top-level planning workspace for generated artifacts."
      },
      {
        name: "Requirement",
        fields: {
          id: "string",
          projectId: "string",
          title: "string",
          priority: "enum",
          confidence: "enum"
        },
        relationships: {
          project: "many-to-one"
        },
        notes: "Structured requirement generated from the client brief."
      },
      {
        name: "UserStory",
        fields: {
          id: "string",
          role: "string",
          goal: "string",
          benefit: "string",
          acceptanceCriteria: "string[]"
        },
        relationships: {
          project: "many-to-one"
        },
        notes: "Implementation-ready planning item derived from requirements."
      }
    ],
    apiRoutes: [
      {
        method: HttpMethod.POST,
        path: "/api/requirements/projects",
        purpose: "Create a new requirements project",
        requestBody: {
          name: "string",
          industry: "string",
          rawBrief: "string"
        },
        responseShape: {
          id: "string",
          status: "draft"
        },
        permission: "admin",
        relatedDataModel: "Project"
      },
      {
        method: HttpMethod.POST,
        path: "/api/requirements/projects/:id/analyze",
        purpose: "Analyze a client brief and generate structured requirements",
        requestBody: undefined,
        responseShape: {
          generated: {
            requirements: "number",
            clarifyingQuestions: "number"
          }
        },
        permission: "admin",
        relatedDataModel: "Requirement"
      },
      {
        method: HttpMethod.GET,
        path: "/api/requirements/projects/:id/export/markdown",
        purpose: "Export the generated proposal markdown",
        requestBody: undefined,
        responseShape: {
          filename: "string",
          markdown: "string"
        },
        permission: "admin",
        relatedDataModel: "GeneratedProposal"
      }
    ],
    proposal: {
      title: `${project.name} Proposal`,
      markdown: proposalMarkdown
    }
  };
}

export async function generateRequirementArtifacts(
  projectId: string
): Promise<GenerateRequirementArtifactsResponse> {
  const project = await prisma.requirementProject.findUnique({
    where: {
      id: projectId
    },
    include: {
      brief: true,
      requirements: {
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }]
      },
      clarifyingQuestions: {
        orderBy: [{ createdAt: "asc" }]
      }
    }
  });

  if (!project) {
    throw new RequirementProjectNotFoundError(projectId);
  }

  const artifacts = buildRequirementArtifacts(project);

  await prisma.$transaction([
    prisma.generatedProposal.deleteMany({ where: { projectId } }),
    prisma.apiRouteSuggestion.deleteMany({ where: { projectId } }),
    prisma.dataEntity.deleteMany({ where: { projectId } }),
    prisma.userStory.deleteMany({ where: { projectId } }),
    prisma.feature.deleteMany({ where: { projectId } }),
    prisma.feature.createMany({
      data: artifacts.features.map((feature) => ({
        ...feature,
        projectId
      }))
    }),
    prisma.userStory.createMany({
      data: artifacts.userStories.map((story) => ({
        ...story,
        projectId
      }))
    }),
    prisma.dataEntity.createMany({
      data: artifacts.dataEntities.map((entity) => ({
        ...entity,
        projectId
      }))
    }),
    prisma.apiRouteSuggestion.createMany({
      data: artifacts.apiRoutes.map((route) => ({
        ...route,
        projectId
      }))
    }),
    prisma.generatedProposal.create({
      data: {
        projectId,
        title: artifacts.proposal.title,
        markdown: artifacts.proposal.markdown
      }
    }),
    prisma.requirementProject.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.PROPOSAL_READY,
        completionPercentage: 75
      }
    }),
    prisma.auditLog.create({
      data: {
        action: "requirements.artifacts.generated",
        module: "REQUIREMENTS",
        entityType: "RequirementProject",
        entityId: projectId,
        metadata: {
          features: artifacts.features.length,
          userStories: artifacts.userStories.length,
          dataEntities: artifacts.dataEntities.length,
          apiRoutes: artifacts.apiRoutes.length
        }
      }
    })
  ]);

  return {
    project: await getRequirementProject(projectId),
    generated: {
      features: artifacts.features.length,
      userStories: artifacts.userStories.length,
      dataEntities: artifacts.dataEntities.length,
      apiRoutes: artifacts.apiRoutes.length,
      proposals: 1
    }
  };
}

export async function exportRequirementProposalMarkdown(
  projectId: string
): Promise<MarkdownExportResponse> {
  const project = await prisma.requirementProject.findUnique({
    where: { id: projectId },
    include: {
      proposals: {
        orderBy: { updatedAt: "desc" },
        take: 1
      }
    }
  });

  if (!project) {
    throw new RequirementProjectNotFoundError(projectId);
  }

  const proposal = project.proposals[0];
  const markdown =
    proposal?.markdown ??
    `# ${project.name} Proposal\n\nNo generated proposal exists yet. Generate planning artifacts first.`;
  const filename = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-proposal.md`;

  await prisma.auditLog.create({
    data: {
      action: "requirements.proposal.exported",
      module: "REQUIREMENTS",
      entityType: "RequirementProject",
      entityId: projectId,
      metadata: {
        filename,
        proposalId: proposal?.id ?? null
      }
    }
  });

  return {
    projectId,
    filename,
    markdown
  };
}
