import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
};

export function EmptyState({ icon: Icon, title }: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-muted text-slate-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-medium text-ink">{title}</p>
    </div>
  );
}
