import type {
  OpsJobSummary,
  OpsRecommendation,
  TechnicianScoreBreakdown,
  TechnicianSummary
} from "@ai-ops-studio/shared";
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  RadioTower,
  Sparkles,
  UserRoundCheck,
  XCircle
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  useApproveRecommendationMutation,
  useGetOpsDashboardQuery,
  useRecommendTechnicianMutation,
  useRejectRecommendationMutation
} from "../../app/api";
import { DataTable, type DataTableColumn } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { MetricCard } from "../../components/ui/MetricCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusPill } from "../../components/ui/StatusPill";

function statusTone(status: string) {
  if (status === "COMPLETED" || status === "AVAILABLE" || status === "APPROVED") {
    return "green" as const;
  }

  if (status === "DELAYED" || status === "URGENT" || status === "PENDING_APPROVAL") {
    return "amber" as const;
  }

  if (status === "CANCELLED" || status === "REJECTED" || status === "OFFLINE") {
    return "red" as const;
  }

  if (status === "ASSIGNED" || status === "EN_ROUTE" || status === "BUSY") {
    return "blue" as const;
  }

  return "gray" as const;
}

function formatDeadline(deadline: string) {
  return new Date(deadline).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

const technicianColumns: Array<DataTableColumn<TechnicianSummary>> = [
  {
    header: "Technician",
    cell: (technician) => (
      <div>
        <p className="font-medium text-ink">{technician.name}</p>
        <p className="text-sm text-ink-muted">{technician.skills.join(", ")}</p>
      </div>
    )
  },
  {
    header: "Status",
    cell: (technician) => <StatusPill label={technician.status} tone={statusTone(technician.status)} />
  },
  {
    header: "Jobs",
    align: "right",
    cell: (technician) => technician.currentJobCount
  },
  {
    header: "Completed",
    align: "right",
    cell: (technician) => technician.completedJobsToday
  }
];

function ScoreBreakdown({ rows }: { rows: TechnicianScoreBreakdown[] }) {
  if (rows.length === 0) {
    return <EmptyState icon={RadioTower} title="No scoring breakdown available" />;
  }

  return (
    <div className="space-y-2">
      {rows.slice(0, 5).map((row) => (
        <div key={row.technicianId} className="rounded-md border border-slate-200 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-ink">{row.technicianName}</p>
            <StatusPill label={`${row.score.toFixed(1)} score`} tone={row.score >= 75 ? "green" : "amber"} />
          </div>
          <div className="mt-3 grid gap-2 text-xs text-ink-muted md:grid-cols-5">
            <span>Skill {row.skillMatch}</span>
            <span>Avail {row.availability}</span>
            <span>Distance {row.distanceScore}</span>
            <span>Workload {row.workloadScore}</span>
            <span>SLA {row.slaUrgency}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecommendationPanel({
  recommendation,
  onApprove,
  onReject,
  isApproving,
  isRejecting
}: {
  recommendation: OpsRecommendation | null;
  onApprove: (recommendationId: string) => void;
  onReject: (recommendationId: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  if (!recommendation) {
    return <EmptyState icon={Sparkles} title="Generate a technician recommendation" />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-ink-muted">Recommended technician</p>
            <h3 className="mt-1 text-xl font-semibold text-ink">
              {recommendation.recommendedTechnicianName}
            </h3>
          </div>
          <StatusPill label={recommendation.status} tone={statusTone(recommendation.status)} />
        </div>
        <p className="mt-3 text-sm text-ink-muted">{recommendation.explanation}</p>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <div>
            <p className="text-ink-muted">Score</p>
            <p className="font-semibold text-ink">{recommendation.score.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-ink-muted">Confidence</p>
            <p className="font-semibold text-ink">{recommendation.confidence}</p>
          </div>
          <div>
            <p className="text-ink-muted">Job</p>
            <p className="font-semibold text-ink">{recommendation.jobId}</p>
          </div>
        </div>
      </div>

      <ScoreBreakdown rows={recommendation.breakdown} />

      {recommendation.status === "PENDING_APPROVAL" ? (
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => onReject(recommendation.id)}
            disabled={isRejecting}
            className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            {isRejecting ? "Rejecting" : "Reject"}
          </button>
          <button
            type="button"
            onClick={() => onApprove(recommendation.id)}
            disabled={isApproving}
            className="inline-flex items-center gap-2 rounded-md bg-signal-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {isApproving ? "Approving" : "Approve assignment"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function OperationsCopilotPage() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [latestRecommendation, setLatestRecommendation] = useState<OpsRecommendation | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, isError } = useGetOpsDashboardQuery();
  const [recommendTechnician, recommendState] = useRecommendTechnicianMutation();
  const [approveRecommendation, approveState] = useApproveRecommendationMutation();
  const [rejectRecommendation, rejectState] = useRejectRecommendationMutation();
  const jobs = data?.jobs ?? [];
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0] ?? null;

  const jobColumns: Array<DataTableColumn<OpsJobSummary>> = useMemo(
    () => [
      {
        header: "Job",
        cell: (job) => (
          <button type="button" onClick={() => setSelectedJobId(job.id)} className="text-left">
            <span className="font-medium text-ink">{job.id}</span>
            <span className="block text-sm text-ink-muted">{job.customerName}</span>
          </button>
        )
      },
      {
        header: "Service",
        cell: (job) => (
          <div>
            <p className="font-medium text-ink">{job.serviceType}</p>
            <p className="text-sm text-ink-muted">{job.locationLabel}</p>
          </div>
        )
      },
      {
        header: "Status",
        cell: (job) => <StatusPill label={job.status} tone={statusTone(job.status)} />
      },
      {
        header: "SLA",
        align: "right",
        cell: (job) => formatDeadline(job.slaDeadline)
      },
      {
        header: "Risk",
        align: "right",
        cell: (job) => job.delayRiskScore
      }
    ],
    []
  );

  const metrics = data
    ? [
        {
          label: "Active jobs",
          value: String(data.summary.activeJobs),
          detail: `${data.summary.delayedJobs} delayed`,
          tone: "blue" as const
        },
        {
          label: "Available techs",
          value: String(data.summary.availableTechnicians),
          detail: "Ready for assignment",
          tone: "green" as const
        },
        {
          label: "Pending approvals",
          value: String(data.summary.pendingRecommendations),
          detail: "AI recommendations waiting",
          tone: data.summary.pendingRecommendations > 0 ? ("amber" as const) : ("gray" as const)
        },
        {
          label: "SLA breaches",
          value: String(data.summary.slaBreaches),
          detail: "Active jobs past deadline",
          tone: data.summary.slaBreaches > 0 ? ("red" as const) : ("green" as const)
        }
      ]
    : [];

  async function handleRecommend(jobId: string) {
    setActionError(null);

    try {
      const recommendation = await recommendTechnician(jobId).unwrap();
      setLatestRecommendation(recommendation);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not create recommendation.");
    }
  }

  async function handleApprove(recommendationId: string) {
    setActionError(null);

    try {
      const recommendation = await approveRecommendation(recommendationId).unwrap();
      setLatestRecommendation(recommendation);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not approve recommendation.");
    }
  }

  async function handleReject(recommendationId: string) {
    setActionError(null);

    try {
      const recommendation = await rejectRecommendation(recommendationId).unwrap();
      setLatestRecommendation(recommendation);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not reject recommendation.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations Copilot"
        title="Dispatch and recommendation control"
        actions={<StatusPill label="Human approval required" tone="blue" />}
      />

      {isError ? <ErrorState title="Operations dashboard is unavailable." /> : null}
      {actionError ? <ErrorState title={actionError} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Active jobs</h3>
          </div>
          {jobs.length > 0 ? (
            <DataTable columns={jobColumns} rows={jobs} getRowKey={(job) => job.id} />
          ) : (
            <EmptyState icon={ClipboardCheck} title="No active jobs loaded" />
          )}
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserRoundCheck className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <h3 className="font-semibold text-ink">Copilot recommendation</h3>
            </div>
            {selectedJob ? <StatusPill label={selectedJob.id} tone={statusTone(selectedJob.status)} /> : null}
          </div>

          {selectedJob ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="font-medium text-ink">{selectedJob.serviceType}</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>{selectedJob.locationLabel}</span>
                </div>
                <p className="mt-2 text-sm text-ink-muted">
                  Required skill: {selectedJob.requiredSkill}. Current assignment:{" "}
                  {selectedJob.assignedTechnicianName ?? "unassigned"}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRecommend(selectedJob.id)}
                disabled={recommendState.isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {recommendState.isLoading ? "Scoring technicians" : "Recommend technician"}
              </button>
              <RecommendationPanel
                recommendation={latestRecommendation ?? data?.pendingRecommendations[0] ?? null}
                onApprove={handleApprove}
                onReject={handleReject}
                isApproving={approveState.isLoading}
                isRejecting={rejectState.isLoading}
              />
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState icon={RadioTower} title="Select a job to score technicians" />
            </div>
          )}
        </section>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <RadioTower className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <h3 className="font-semibold text-ink">Technician availability</h3>
        </div>
        {data?.technicians.length ? (
          <DataTable
            columns={technicianColumns}
            rows={data.technicians}
            getRowKey={(technician) => technician.id}
          />
        ) : (
          <EmptyState icon={UserRoundCheck} title="No technicians loaded" />
        )}
      </section>
    </div>
  );
}
