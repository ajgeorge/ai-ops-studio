import { StatusPill } from "./StatusPill";

type PromptVersionBadgeProps = {
  promptKey: string;
  version: number;
  status?: string;
};

export function PromptVersionBadge({ promptKey, version, status = "ACTIVE" }: PromptVersionBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
        {promptKey}@v{version}
      </code>
      <StatusPill label={status} tone={status === "ACTIVE" ? "green" : "gray"} />
    </div>
  );
}
