import type {
  AiDemoRunResponse,
  AiDemoWorkflow,
  AiRunListItem,
  PromptVersionSummary
} from "@ai-ops-studio/shared";
import { Bot, FileText, ListChecks, RadioTower, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";

import {
  useGetAiRunsQuery,
  useGetPromptVersionsQuery,
  useRunDemoAiWorkflowMutation
} from "../../app/api";
import { AIPromptBox } from "../../components/ai/AIPromptBox";
import { AIRunTimeline } from "../../components/ai/AIRunTimeline";
import { DataTable, type DataTableColumn } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { MetricCard } from "../../components/ui/MetricCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { PromptVersionBadge } from "../../components/ui/PromptVersionBadge";
import { StatusPill } from "../../components/ui/StatusPill";

const defaultInputs: Record<AiDemoWorkflow, string> = {
  "requirements.analyzeBrief": JSON.stringify(
    {
      industry: "Garage operations",
      brief:
        "We need a garage management system for customers, vehicles, jobs, departments, inventory, payments, and reports."
    },
    null,
    2
  ),
  "operations.explainRecommendation": JSON.stringify(
    {
      jobId: "JOB-1042",
      technicianName: "Omar Hassan",
      score: 91.4,
      serviceType: "Battery replacement"
    },
    null,
    2
  ),
  "rag.answerWithContext": JSON.stringify(
    {
      question: "When should an urgent roadside job be escalated?",
      chunkId: "sample-policy-chunk-1"
    },
    null,
    2
  )
};

function statusTone(status: string) {
  if (status === "SUCCEEDED" || status === "ACTIVE" || status === "succeeded") {
    return "green" as const;
  }

  if (status === "FAILED" || status === "VALIDATION_FAILED" || status === "failed") {
    return "red" as const;
  }

  return "amber" as const;
}

function averageLatency(runs: AiRunListItem[]) {
  const values = runs.map((run) => run.latencyMs).filter((value): value is number => value !== null);

  if (values.length === 0) {
    return "0ms";
  }

  return `${Math.round(values.reduce((total, value) => total + value, 0) / values.length)}ms`;
}

function parseJsonObject(input: string) {
  const parsed = JSON.parse(input) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Input must be a JSON object.");
  }

  return parsed as Record<string, unknown>;
}

function formatOutput(result: AiDemoRunResponse) {
  return JSON.stringify(result.output, null, 2);
}

const promptColumns: Array<DataTableColumn<PromptVersionSummary>> = [
  {
    header: "Prompt",
    cell: (prompt) => (
      <PromptVersionBadge promptKey={prompt.key} version={prompt.version} status={prompt.status} />
    )
  },
  {
    header: "Module",
    cell: (prompt) => <StatusPill label={prompt.module} tone="gray" />
  },
  {
    header: "Title",
    cell: (prompt) => <span className="font-medium">{prompt.title}</span>
  },
  {
    header: "Updated",
    align: "right",
    cell: (prompt) => new Date(prompt.updatedAt).toLocaleDateString()
  }
];

export function AIControlCenterPage() {
  const [workflow, setWorkflow] = useState<AiDemoWorkflow>("requirements.analyzeBrief");
  const [input, setInput] = useState(defaultInputs["requirements.analyzeBrief"]);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<AiDemoRunResponse | null>(null);
  const { data: runs, isError: runsError } = useGetAiRunsQuery();
  const { data: prompts, isError: promptsError } = useGetPromptVersionsQuery();
  const [runDemo, runDemoState] = useRunDemoAiWorkflowMutation();

  const aiRuns = runs ?? [];
  const promptVersions = prompts ?? [];
  const failedRuns = aiRuns.filter((run) => run.status === "FAILED" || run.status === "VALIDATION_FAILED");
  const activePrompts = promptVersions.filter((prompt) => prompt.status === "ACTIVE");

  const metrics = useMemo(
    () => [
      {
        label: "AI runs",
        value: String(aiRuns.length),
        detail: "Recorded workflow executions",
        tone: "teal" as const
      },
      {
        label: "Active prompts",
        value: String(activePrompts.length),
        detail: "Prompt versions available",
        tone: "blue" as const
      },
      {
        label: "Failed runs",
        value: String(failedRuns.length),
        detail: "Provider or validation failures",
        tone: failedRuns.length > 0 ? ("red" as const) : ("green" as const)
      },
      {
        label: "Avg latency",
        value: averageLatency(aiRuns),
        detail: "Across recent runs",
        tone: "amber" as const
      }
    ],
    [activePrompts.length, aiRuns, failedRuns.length]
  );

  async function handleRunDemo() {
    setJsonError(null);

    try {
      const parsedInput = parseJsonObject(input);
      const result = await runDemo({ workflow, input: parsedInput }).unwrap();
      setLastResult(result);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "AI demo run failed.");
    }
  }

  function handleWorkflowChange(nextWorkflow: AiDemoWorkflow) {
    setWorkflow(nextWorkflow);
    setInput(defaultInputs[nextWorkflow]);
    setJsonError(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Control Center"
        title="Prompt and run operations"
        actions={<StatusPill label="Mock provider" tone="green" />}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <AIPromptBox
            workflow={workflow}
            input={input}
            isRunning={runDemoState.isLoading}
            onWorkflowChange={handleWorkflowChange}
            onInputChange={setInput}
            onRun={handleRunDemo}
          />
          {jsonError ? <ErrorState title={jsonError} /> : null}
          {runDemoState.isError ? <ErrorState title="AI demo run failed." /> : null}
        </div>

        <section className="rounded-md border border-slate-200 bg-white shadow-panel">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <h3 className="font-semibold text-ink">Latest demo output</h3>
            {lastResult ? <StatusPill label={lastResult.status} tone={statusTone(lastResult.status)} /> : null}
          </div>
          {lastResult ? (
            <div className="space-y-3 p-4">
              <div className="grid gap-3 text-sm md:grid-cols-3">
                <div>
                  <p className="text-ink-muted">Provider</p>
                  <p className="font-medium text-ink">{lastResult.provider}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Prompt</p>
                  <p className="font-medium text-ink">{lastResult.promptVersion.key}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Latency</p>
                  <p className="font-medium text-ink">{lastResult.latencyMs}ms</p>
                </div>
              </div>
              <pre className="max-h-96 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-50">
                {formatOutput(lastResult)}
              </pre>
            </div>
          ) : (
            <div className="p-4">
              <EmptyState icon={Bot} title="No demo output yet" />
            </div>
          )}
        </section>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <RadioTower className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Recent runs</h3>
          </div>
          {runsError ? <ErrorState title="AI runs are unavailable." /> : null}
          {aiRuns.length > 0 ? (
            <AIRunTimeline runs={aiRuns.slice(0, 8)} />
          ) : (
            <EmptyState icon={ListChecks} title="No AI runs recorded" />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Prompt registry</h3>
          </div>
          {promptsError ? <ErrorState title="Prompt versions are unavailable." /> : null}
          {promptVersions.length > 0 ? (
            <DataTable
              columns={promptColumns}
              rows={promptVersions.slice(0, 8)}
              getRowKey={(prompt) => prompt.id}
            />
          ) : (
            <EmptyState icon={ShieldAlert} title="No prompt versions found" />
          )}
        </div>
      </section>
    </div>
  );
}
