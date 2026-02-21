import type { AuditLogItem } from "@ai-ops-studio/shared";
import { History, ShieldCheck } from "lucide-react";
import { useMemo } from "react";

import { useGetAuditLogsQuery } from "../../app/api";
import { DataTable, type DataTableColumn } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { MetricCard } from "../../components/ui/MetricCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusPill } from "../../components/ui/StatusPill";

const auditColumns: Array<DataTableColumn<AuditLogItem>> = [
  {
    header: "Action",
    cell: (log) => (
      <div>
        <p className="font-medium text-ink">{log.action}</p>
        <p className="text-sm text-ink-muted">{log.id}</p>
      </div>
    )
  },
  {
    header: "Module",
    cell: (log) => <StatusPill label={log.module} tone="gray" />
  },
  {
    header: "Entity",
    cell: (log) => (
      <div>
        <p className="font-medium text-ink">{log.entityType}</p>
        <p className="text-sm text-ink-muted">{log.entityId ?? "system"}</p>
      </div>
    )
  },
  {
    header: "Actor",
    cell: (log) => log.actorId
  },
  {
    header: "Created",
    align: "right",
    cell: (log) => new Date(log.createdAt).toLocaleString()
  }
];

export function AuditLogsPage() {
  const { data, isError } = useGetAuditLogsQuery();
  const logs = data ?? [];
  const moduleCount = new Set(logs.map((log) => log.module)).size;
  const latestLog = logs[0];
  const metrics = useMemo(
    () => [
      {
        label: "Audit events",
        value: String(logs.length),
        detail: "Recent tracked actions",
        tone: "teal" as const
      },
      {
        label: "Modules",
        value: String(moduleCount),
        detail: "Workflow areas represented",
        tone: "blue" as const
      },
      {
        label: "Latest module",
        value: latestLog?.module ?? "None",
        detail: latestLog?.entityType ?? "No events loaded",
        tone: "gray" as const
      }
    ],
    [latestLog?.entityType, latestLog?.module, logs.length, moduleCount]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audit Logs"
        title="Tracked workflow activity"
        actions={<StatusPill label="Append-only events" tone="blue" />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      {isError ? <ErrorState title="Audit logs are unavailable." /> : null}

      {logs.length > 0 ? (
        <DataTable columns={auditColumns} rows={logs} getRowKey={(log) => log.id} />
      ) : (
        <EmptyState icon={History} title="No audit events found" />
      )}

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <h3 className="font-semibold text-ink">Event metadata</h3>
        </div>
        <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-50">
          {JSON.stringify(latestLog?.metadata ?? {}, null, 2)}
        </pre>
      </section>
    </div>
  );
}
