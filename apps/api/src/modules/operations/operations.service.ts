import {
  AppModule,
  ConfidenceLevel,
  JobStatus,
  Prisma,
  RecommendationStatus,
  TechnicianStatus
} from "@prisma/client";
import type {
  OpsDashboardResponse,
  OpsJobSummary,
  OpsRecommendation,
  TechnicianScoreBreakdown,
  TechnicianSummary
} from "@ai-ops-studio/shared";

import { prisma } from "../../db/prisma.js";
import { runDemoAIWorkflow } from "../ai/ai-workflow.service.js";
import { operationsRecommendationExplanationSchema } from "../ai/workflow-schemas.js";

export class OpsEntityNotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
    this.name = "OpsEntityNotFoundError";
  }
}

export class OpsInvalidActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpsInvalidActionError";
  }
}

const activeJobStatuses = [
  JobStatus.PENDING,
  JobStatus.ASSIGNED,
  JobStatus.ACCEPTED,
  JobStatus.EN_ROUTE,
  JobStatus.ARRIVED,
  JobStatus.IN_PROGRESS,
  JobStatus.DELAYED
];

const jobInclude = {
  customer: true,
  vehicle: true,
  serviceType: true,
  assignedTechnician: true
} satisfies Prisma.JobInclude;

const recommendationInclude = {
  job: true,
  recommendedTechnician: true
} satisfies Prisma.AIRecommendationInclude;

type OpsJobWithRelations = Prisma.JobGetPayload<{ include: typeof jobInclude }>;
type RecommendationWithRelations = Prisma.AIRecommendationGetPayload<{
  include: typeof recommendationInclude;
}>;

type ScoreTechnicianInput = {
  id: string;
  name: string;
  skills: string[];
  status: TechnicianStatus;
  currentJobCount: number;
  latitude: number | null;
  longitude: number | null;
};

type ScoreJobInput = {
  requiredSkill: string;
  latitude: number;
  longitude: number;
  slaDeadline: Date;
};

function round(value: number, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function distanceKm(
  from: { latitude: number | null; longitude: number | null },
  to: { latitude: number; longitude: number }
) {
  if (from.latitude === null || from.longitude === null) {
    return null;
  }

  const earthRadiusKm = 6371;
  const latDistance = ((to.latitude - from.latitude) * Math.PI) / 180;
  const lonDistance = ((to.longitude - from.longitude) * Math.PI) / 180;
  const startLat = (from.latitude * Math.PI) / 180;
  const endLat = (to.latitude * Math.PI) / 180;
  const a =
    Math.sin(latDistance / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lonDistance / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function availabilityScore(status: TechnicianStatus) {
  if (status === TechnicianStatus.AVAILABLE) {
    return 1;
  }

  if (status === TechnicianStatus.ON_BREAK) {
    return 0.45;
  }

  if (status === TechnicianStatus.BUSY) {
    return 0.25;
  }

  return 0;
}

function workloadScore(currentJobCount: number) {
  return Math.max(0, 1 - currentJobCount / 4);
}

function distanceScore(distance: number | null) {
  if (distance === null) {
    return 0.35;
  }

  return Math.max(0, 1 - Math.min(distance, 20) / 20);
}

function slaUrgencyScore(slaDeadline: Date) {
  const minutesRemaining = (slaDeadline.getTime() - Date.now()) / 60_000;

  if (minutesRemaining <= 0) {
    return 1;
  }

  if (minutesRemaining <= 30) {
    return 0.85;
  }

  if (minutesRemaining <= 60) {
    return 0.55;
  }

  return 0.25;
}

export function scoreTechnicianForJob(
  technician: ScoreTechnicianInput,
  job: ScoreJobInput
): TechnicianScoreBreakdown {
  const distance = distanceKm(technician, job);
  const skillMatch = technician.skills.includes(job.requiredSkill) ? 1 : 0;
  const availability = availabilityScore(technician.status);
  const distanceComponent = distanceScore(distance);
  const workload = workloadScore(technician.currentJobCount);
  const slaUrgency = slaUrgencyScore(job.slaDeadline);
  const score =
    skillMatch * 35 +
    availability * 25 +
    distanceComponent * 20 +
    workload * 15 +
    slaUrgency * 5;

  return {
    technicianId: technician.id,
    technicianName: technician.name,
    score: round(score, 2),
    skillMatch: round(skillMatch),
    availability: round(availability),
    distanceScore: round(distanceComponent),
    workloadScore: round(workload),
    slaUrgency: round(slaUrgency),
    distanceKm: distance === null ? null : round(distance)
  };
}

function mapJob(job: OpsJobWithRelations): OpsJobSummary {
  return {
    id: job.id,
    customerName: job.customer.name,
    vehicle: `${job.vehicle.make} ${job.vehicle.model} (${job.vehicle.plate})`,
    serviceType: job.serviceType.name,
    requiredSkill: job.serviceType.requiredSkill,
    locationLabel: job.locationLabel,
    status: job.status,
    priority: job.priority,
    assignedTechnicianName: job.assignedTechnician?.name ?? null,
    slaDeadline: job.slaDeadline.toISOString(),
    delayRiskScore: job.delayRiskScore,
    createdAt: job.createdAt.toISOString()
  };
}

function mapTechnician(technician: {
  id: string;
  name: string;
  skills: string[];
  status: TechnicianStatus;
  currentJobCount: number;
  completedJobsToday: number;
  averageCompletionMin: number;
  latitude: number | null;
  longitude: number | null;
}): TechnicianSummary {
  return {
    id: technician.id,
    name: technician.name,
    skills: technician.skills,
    status: technician.status,
    currentJobCount: technician.currentJobCount,
    completedJobsToday: technician.completedJobsToday,
    averageCompletionMin: technician.averageCompletionMin,
    latitude: technician.latitude,
    longitude: technician.longitude
  };
}

function mapRecommendation(
  recommendation: RecommendationWithRelations,
  breakdown: TechnicianScoreBreakdown[] = []
): OpsRecommendation {
  return {
    id: recommendation.id,
    jobId: recommendation.jobId,
    recommendedTechnicianId: recommendation.recommendedTechnicianId,
    recommendedTechnicianName: recommendation.recommendedTechnician.name,
    score: recommendation.score,
    confidence: recommendation.confidence,
    explanation: recommendation.explanation,
    status: recommendation.status,
    breakdown,
    createdAt: recommendation.createdAt.toISOString()
  };
}

export async function getOpsDashboard(): Promise<OpsDashboardResponse> {
  const [
    jobs,
    technicians,
    pendingRecommendations,
    activeJobs,
    delayedJobs,
    availableTechnicians,
    jobsCompletedToday,
    slaBreaches
  ] = await Promise.all([
    prisma.job.findMany({
      where: {
        status: {
          in: activeJobStatuses
        }
      },
      orderBy: [{ delayRiskScore: "desc" }, { slaDeadline: "asc" }],
      take: 25,
      include: jobInclude
    }),
    prisma.technician.findMany({
      orderBy: [{ status: "asc" }, { currentJobCount: "asc" }, { name: "asc" }]
    }),
    prisma.aIRecommendation.findMany({
      where: {
        status: RecommendationStatus.PENDING_APPROVAL
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10,
      include: recommendationInclude
    }),
    prisma.job.count({
      where: {
        status: {
          in: activeJobStatuses
        }
      }
    }),
    prisma.job.count({ where: { status: JobStatus.DELAYED } }),
    prisma.technician.count({ where: { status: TechnicianStatus.AVAILABLE } }),
    prisma.job.count({ where: { status: JobStatus.COMPLETED } }),
    prisma.job.count({
      where: {
        status: {
          in: activeJobStatuses
        },
        slaDeadline: {
          lt: new Date()
        }
      }
    })
  ]);

  return {
    summary: {
      activeJobs,
      delayedJobs,
      availableTechnicians,
      pendingRecommendations: pendingRecommendations.length,
      jobsCompletedToday,
      averageResponseTimeMin: 32,
      slaBreaches
    },
    jobs: jobs.map(mapJob),
    technicians: technicians.map(mapTechnician),
    pendingRecommendations: pendingRecommendations.map((recommendation) =>
      mapRecommendation(recommendation)
    )
  };
}

export async function recommendTechnicianForJob(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      serviceType: true
    }
  });

  if (!job) {
    throw new OpsEntityNotFoundError("Job", jobId);
  }

  const technicians = await prisma.technician.findMany({
    where: {
      status: {
        not: TechnicianStatus.OFFLINE
      }
    },
    orderBy: [{ currentJobCount: "asc" }, { name: "asc" }]
  });

  if (technicians.length === 0) {
    throw new OpsInvalidActionError("No online technicians are available for scoring.");
  }

  const breakdown = technicians
    .map((technician) =>
      scoreTechnicianForJob(technician, {
        requiredSkill: job.serviceType.requiredSkill,
        latitude: job.latitude,
        longitude: job.longitude,
        slaDeadline: job.slaDeadline
      })
    )
    .sort((left, right) => right.score - left.score);
  const best = breakdown[0]!;
  const aiRun = await runDemoAIWorkflow("operations.explainRecommendation", {
    jobId: job.id,
    technicianName: best.technicianName,
    score: best.score,
    serviceType: job.serviceType.name
  });
  const explanation = operationsRecommendationExplanationSchema.parse(aiRun.output);
  const recommendation = await prisma.aIRecommendation.create({
    data: {
      jobId: job.id,
      recommendedTechnicianId: best.technicianId,
      score: best.score,
      confidence:
        explanation.confidence === "high"
          ? ConfidenceLevel.HIGH
          : explanation.confidence === "low"
            ? ConfidenceLevel.LOW
            : ConfidenceLevel.MEDIUM,
      explanation: explanation.reasons.join(" ")
    },
    include: recommendationInclude
  });

  await prisma.auditLog.create({
    data: {
      action: "ops.recommendation.created",
      module: AppModule.OPERATIONS,
      entityType: "AIRecommendation",
      entityId: recommendation.id,
      metadata: {
        jobId,
        aiRunId: aiRun.runId,
        score: best.score,
        technicianName: best.technicianName
      }
    }
  });

  return mapRecommendation(recommendation, breakdown);
}

export async function approveRecommendation(recommendationId: string) {
  const recommendation = await prisma.aIRecommendation.findUnique({
    where: { id: recommendationId },
    include: recommendationInclude
  });

  if (!recommendation) {
    throw new OpsEntityNotFoundError("Recommendation", recommendationId);
  }

  if (recommendation.status !== RecommendationStatus.PENDING_APPROVAL) {
    throw new OpsInvalidActionError("Only pending recommendations can be approved.");
  }

  await prisma.$transaction([
    prisma.aIRecommendation.update({
      where: { id: recommendationId },
      data: {
        status: RecommendationStatus.APPROVED
      }
    }),
    prisma.job.update({
      where: { id: recommendation.jobId },
      data: {
        assignedTechnicianId: recommendation.recommendedTechnicianId,
        status: JobStatus.ASSIGNED
      }
    }),
    prisma.technician.update({
      where: { id: recommendation.recommendedTechnicianId },
      data: {
        status: TechnicianStatus.BUSY,
        currentJobCount: {
          increment: 1
        }
      }
    }),
    prisma.jobEvent.create({
      data: {
        jobId: recommendation.jobId,
        status: JobStatus.ASSIGNED,
        note: `Approved AI recommendation for ${recommendation.recommendedTechnician.name}.`
      }
    }),
    prisma.auditLog.create({
      data: {
        action: "ops.recommendation.approved",
        module: AppModule.OPERATIONS,
        entityType: "AIRecommendation",
        entityId: recommendationId,
        metadata: {
          jobId: recommendation.jobId,
          technicianId: recommendation.recommendedTechnicianId,
          technicianName: recommendation.recommendedTechnician.name
        }
      }
    })
  ]);

  const updated = await prisma.aIRecommendation.findUniqueOrThrow({
    where: { id: recommendationId },
    include: recommendationInclude
  });

  return mapRecommendation(updated);
}

export async function rejectRecommendation(recommendationId: string) {
  const recommendation = await prisma.aIRecommendation.findUnique({
    where: { id: recommendationId },
    include: recommendationInclude
  });

  if (!recommendation) {
    throw new OpsEntityNotFoundError("Recommendation", recommendationId);
  }

  if (recommendation.status !== RecommendationStatus.PENDING_APPROVAL) {
    throw new OpsInvalidActionError("Only pending recommendations can be rejected.");
  }

  const updated = await prisma.aIRecommendation.update({
    where: { id: recommendationId },
    data: {
      status: RecommendationStatus.REJECTED
    },
    include: recommendationInclude
  });

  await prisma.auditLog.create({
    data: {
      action: "ops.recommendation.rejected",
      module: AppModule.OPERATIONS,
      entityType: "AIRecommendation",
      entityId: recommendationId,
      metadata: {
        jobId: recommendation.jobId,
        technicianId: recommendation.recommendedTechnicianId,
        technicianName: recommendation.recommendedTechnician.name
      }
    }
  });

  return mapRecommendation(updated);
}
