import { Activity, AlertTriangle, ClipboardCheck, FileSearch, type LucideIcon } from "lucide-react";

import { useGetDashboardSummaryQuery, useGetHealthQuery } from "../../app/api";
import { MetricCard } from "../../components/ui/MetricCard";
import { StatusPill } from "../../components/ui/StatusPill";

const metrics = [
  {
    label: "Projects analyzed",
    value: "0",
    detail: "Ready for Requirements Engine seed data.",
    tone: "teal" as const
  },
  {
    label: "Ops recommendations",
    value: "0",
    detail: "Technician scoring lands in the operations slice.",
    tone: "blue" as const
  },
  {
    label: "RAG questions",
    value: "0",
    detail: "Document retrieval is queued for the RAG slice.",
    tone: "green" as const
  },
  {
    label: "Failed AI runs",
    value: "0",
    detail: "Validation failures will surface here.",
    tone: "amber" as const
  }
];

type WorkflowDisplayRow = {
  name: string;
  status: string;
  tone: "blue" | "teal" | "amber" | "red" | "green" | "gray";
  icon: LucideIcon;
};

const workflowRows: WorkflowDisplayRow[] = [
  { name: "Requirements Engine", status: "Foundation", tone: "blue" as const, icon: ClipboardCheck },
  { name: "Operations Copilot", status: "Planned", tone: "gray" as const, icon: Activity },
  { name: "RAG Evaluation Lab", status: "Planned", tone: "gray" as const, icon: FileSearch },
  { name: "AI Control Center", status: "Planned", tone: "gray" as const, icon: AlertTriangle }
];

const workflowIcons = {
  "Requirements Engine": ClipboardCheck,
  "Operations Copilot": Activity,
  "RAG Evaluation Lab": FileSearch,
  "AI Control Center": AlertTriangle
};

export function DashboardPage() {
  const { data, isFetching, isError } = useGetHealthQuery();
  const { data: summary } = useGetDashboardSummaryQuery();
  const visibleMetrics = summary?.metrics ?? metrics;
  const visibleWorkflowRows: WorkflowDisplayRow[] =
    summary?.workflowStatus.map((row) => ({
      ...row,
      icon: workflowIcons[row.name as keyof typeof workflowIcons] ?? AlertTriangle
    })) ?? workflowRows;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-ink-muted">Dashboard</p>
          <h2 className="mt-1 text-3xl font-semibold text-ink">AI workflow operations</h2>
        </div>
        <StatusPill
          label={isError ? "API offline" : isFetching ? "Checking API" : "API healthy"}
          tone={isError ? "red" : isFetching ? "amber" : "green"}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-md border border-slate-200 bg-white shadow-panel">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-semibold text-ink">Workflow status</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {visibleWorkflowRows.map((row) => {
              const Icon = row.icon;

              return (
                <div key={row.name} className="flex items-center justify-between gap-3 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted text-slate-700">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-medium text-ink">{row.name}</span>
                  </div>
                  <StatusPill label={row.status} tone={row.tone} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
          <h3 className="font-semibold text-ink">API health</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Service</dt>
              <dd className="font-medium text-ink">{data?.service ?? "Pending"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Version</dt>
              <dd className="font-medium text-ink">{data?.version ?? "0.1.0"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Modules</dt>
              <dd className="font-medium text-ink">{data?.modules.length ?? 0}</dd>
            </div>
          </dl>
        </div>
      </section>

      {summary ? (
        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-white shadow-panel">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="font-semibold text-ink">Recent AI runs</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {summary.recentAiRuns.map((run) => (
                <div key={run.id} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="font-medium text-ink">{run.workflow}</p>
                    <p className="text-ink-muted">{run.module}</p>
                  </div>
                  <StatusPill label={run.status} tone={run.status === "SUCCEEDED" ? "green" : "amber"} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white shadow-panel">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="font-semibold text-ink">Recent audit logs</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {summary.recentAuditLogs.map((log) => (
                <div key={log.id} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="font-medium text-ink">{log.action}</p>
                    <p className="text-ink-muted">{log.entityType}</p>
                  </div>
                  <StatusPill label={log.module} tone="gray" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
