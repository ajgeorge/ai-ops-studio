import type { AiDemoWorkflow } from "@ai-ops-studio/shared";
import { Play } from "lucide-react";

type AIPromptBoxProps = {
  workflow: AiDemoWorkflow;
  input: string;
  isRunning: boolean;
  onWorkflowChange: (workflow: AiDemoWorkflow) => void;
  onInputChange: (input: string) => void;
  onRun: () => void;
};

const workflows: Array<{ label: string; value: AiDemoWorkflow }> = [
  { label: "Requirements", value: "requirements.analyzeBrief" },
  { label: "Operations", value: "operations.explainRecommendation" },
  { label: "RAG", value: "rag.answerWithContext" }
];

export function AIPromptBox({
  workflow,
  input,
  isRunning,
  onWorkflowChange,
  onInputChange,
  onRun
}: AIPromptBoxProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {workflows.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onWorkflowChange(item.value)}
              className={[
                "rounded-md border px-3 py-2 text-sm font-medium transition",
                workflow === item.value
                  ? "border-signal-teal bg-teal-50 text-signal-teal"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="text-sm font-medium text-ink" htmlFor="ai-demo-input">
          Input JSON
        </label>
        <textarea
          id="ai-demo-input"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          className="min-h-40 resize-y rounded-md border border-slate-300 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-50 outline-none focus:border-signal-teal focus:ring-2 focus:ring-teal-100"
          spellCheck={false}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-md bg-signal-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {isRunning ? "Running" : "Run demo"}
          </button>
        </div>
      </div>
    </section>
  );
}
