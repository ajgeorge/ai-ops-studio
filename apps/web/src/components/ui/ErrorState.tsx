import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  title: string;
};

export function ErrorState({ title }: ErrorStateProps) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium">{title}</span>
      </div>
    </div>
  );
}
