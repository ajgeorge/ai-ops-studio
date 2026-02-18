import { AIRunStatus, AppModule } from "@prisma/client";

import { buildDashboardSummary } from "./dashboard.service.js";

describe("buildDashboardSummary", () => {
  it("formats dashboard metrics from persisted counts", () => {
    const summary = buildDashboardSummary(
      {
        projectCount: 2,
        requirementCount: 9,
        activeJobCount: 4,
        delayedJobCount: 1,
        availableTechnicianCount: 3,
        pendingRecommendationCount: 2,
        ragQuestionCount: 5,
        aiRunsThisWeek: 7,
        failedAiRunCount: 0
      },
      [
        {
          id: "run_1",
          module: AppModule.REQUIREMENTS,
          workflow: "AnalyzeBriefWorkflow",
          status: AIRunStatus.SUCCEEDED,
          latencyMs: 250,
          createdAt: new Date("2026-05-22T10:00:00.000Z")
        }
      ],
      [
        {
          id: "log_1",
          action: "requirements.project.created",
          module: AppModule.REQUIREMENTS,
          entityType: "RequirementProject",
          createdAt: new Date("2026-05-22T10:01:00.000Z")
        }
      ]
    );

    expect(summary.metrics[0]).toMatchObject({
      label: "Projects analyzed",
      value: "2",
      tone: "teal"
    });
    expect(summary.workflowStatus).toContainEqual({
      name: "AI Control Center",
      status: "Logging",
      tone: "green"
    });
    expect(summary.recentAiRuns[0]).toMatchObject({
      id: "run_1",
      module: "REQUIREMENTS",
      status: "SUCCEEDED",
      createdAt: "2026-05-22T10:00:00.000Z"
    });
  });
});
