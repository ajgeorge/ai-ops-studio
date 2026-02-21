import type { AiRunListItem } from "@ai-ops-studio/shared";
import { Bot, CheckCircle2, XCircle } from "lucide-react";

import { StatusPill } from "../ui/StatusPill";

type AIRunTimelineProps = {
  runs: AiRunListItem[];
};

function statusTone(status: string) {
  if (status === "SUCCEEDED") {
    return "green" as const;
  }

  if (status === "FAILED" || status === "VALIDATION_FAILED") {
    return "red" as const;
  }

  return "amber" as const;
}

function statusIcon(status: string) {
  if (status === "SUCCEEDED") {
    return CheckCircle2;
  }

  if (status === "FAILED" || status === "VALIDATION_FAILED") {
    return XCircle;
  }

  return Bot;
}

export function AIRunTimeline({ runs }: AIRunTimelineProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-panel">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="font-semibold text-ink">AI run timeline</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {runs.map((run) => {
          const Icon = statusIcon(run.status);

          return (
            <div key={run.id} className="grid gap-3 px-4 py-4 md:grid-cols-[auto_1fr_auto]">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted text-slate-700">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink">{run.workflow}</p>
                  <StatusPill label={run.status} tone={statusTone(run.status)} />
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {run.module} · {run.promptVersion?.key ?? "default prompt"}
                </p>
              </div>
              <div className="text-left text-sm text-ink-muted md:text-right">
                <p>{run.latencyMs ?? 0}ms</p>
                <p>{new Date(run.createdAt).toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
