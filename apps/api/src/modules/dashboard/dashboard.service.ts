import { AIRunStatus, AppModule, JobStatus, RecommendationStatus, TechnicianStatus } from "@prisma/client";
import type { DashboardSummary, MetricTone } from "@ai-ops-studio/shared";

import { prisma } from "../../db/prisma.js";

type DashboardCounts = {
  projectCount: number;
  requirementCount: number;
  activeJobCount: number;
  delayedJobCount: number;
  availableTechnicianCount: number;
  pendingRecommendationCount: number;
  ragQuestionCount: number;
  aiRunsThisWeek: number;
  failedAiRunCount: number;
};

type RecentAiRunRecord = {
  id: string;
  module: AppModule;
  workflow: string;
  status: AIRunStatus;
  latencyMs: number | null;
  createdAt: Date;
};

type RecentAuditLogRecord = {
  id: string;
  action: string;
  module: AppModule;
  entityType: string;
  createdAt: Date;
};

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function metric(label: string, value: number, detail: string, tone: MetricTone) {
  return {
    label,
    value: value.toLocaleString("en-US"),
    detail,
    tone
  };
}

export function buildDashboardSummary(
  counts: DashboardCounts,
  recentAiRuns: RecentAiRunRecord[],
  recentAuditLogs: RecentAuditLogRecord[]
): DashboardSummary {
  return {
    metrics: [
      metric("Projects analyzed", counts.projectCount, `${counts.requirementCount} requirements generated`, "teal"),
      metric("Active jobs", counts.activeJobCount, `${counts.delayedJobCount} delayed jobs`, "blue"),
      metric(
        "Available technicians",
        counts.availableTechnicianCount,
        `${counts.pendingRecommendationCount} recommendations awaiting approval`,
        "green"
      ),
      metric("RAG questions", counts.ragQuestionCount, "Questions answered against seeded documents", "amber"),
      metric("AI runs this week", counts.aiRunsThisWeek, `${counts.failedAiRunCount} failed or invalid runs`, "gray")
    ],
    workflowStatus: [
      { name: "Requirements Engine", status: counts.projectCount > 0 ? "Seeded" : "Planned", tone: "teal" },
      { name: "Operations Copilot", status: counts.activeJobCount > 0 ? "Seeded" : "Planned", tone: "blue" },
      { name: "RAG Evaluation Lab", status: counts.ragQuestionCount > 0 ? "Seeded" : "Planned", tone: "amber" },
      { name: "AI Control Center", status: recentAiRuns.length > 0 ? "Logging" : "Planned", tone: "green" }
    ],
    recentAiRuns: recentAiRuns.map((run) => ({
      ...run,
      module: run.module.toString(),
      status: run.status.toString(),
      createdAt: run.createdAt.toISOString()
    })),
    recentAuditLogs: recentAuditLogs.map((log) => ({
      ...log,
      module: log.module.toString(),
      createdAt: log.createdAt.toISOString()
    }))
  };
}

export async function getDashboardSummary() {
  const weekStart = startOfWeek(new Date());

  const [
    projectCount,
    requirementCount,
    activeJobCount,
    delayedJobCount,
    availableTechnicianCount,
    pendingRecommendationCount,
    ragQuestionCount,
    aiRunsThisWeek,
    failedAiRunCount,
    recentAiRuns,
    recentAuditLogs
  ] = await Promise.all([
    prisma.requirementProject.count(),
    prisma.requirement.count(),
    prisma.job.count({
      where: {
        status: {
          in: [
            JobStatus.PENDING,
            JobStatus.ASSIGNED,
            JobStatus.ACCEPTED,
            JobStatus.EN_ROUTE,
            JobStatus.ARRIVED,
            JobStatus.IN_PROGRESS,
            JobStatus.DELAYED
          ]
        }
      }
    }),
    prisma.job.count({ where: { status: JobStatus.DELAYED } }),
    prisma.technician.count({ where: { status: TechnicianStatus.AVAILABLE } }),
    prisma.aIRecommendation.count({ where: { status: RecommendationStatus.PENDING_APPROVAL } }),
    prisma.ragQuestion.count(),
    prisma.aIRun.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.aIRun.count({
      where: {
        status: {
          in: [AIRunStatus.FAILED, AIRunStatus.VALIDATION_FAILED]
        }
      }
    }),
    prisma.aIRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        module: true,
        workflow: true,
        status: true,
        latencyMs: true,
        createdAt: true
      }
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        action: true,
        module: true,
        entityType: true,
        createdAt: true
      }
    })
  ]);

  return buildDashboardSummary(
    {
      projectCount,
      requirementCount,
      activeJobCount,
      delayedJobCount,
      availableTechnicianCount,
      pendingRecommendationCount,
      ragQuestionCount,
      aiRunsThisWeek,
      failedAiRunCount
    },
    recentAiRuns,
    recentAuditLogs
  );
}
