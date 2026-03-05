import {
  ConfidenceLevel,
  GeneratedSource,
  Prisma,
  ProjectStatus,
  QuestionStatus,
  RequirementCategory,
  RequirementPriority
} from "@prisma/client";
import type {
  AnalyzeRequirementProjectResponse,
  CreateRequirementProjectRequest,
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
