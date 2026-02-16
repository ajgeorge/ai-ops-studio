type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "blue" | "teal" | "amber" | "red" | "green";
};

const toneClassNames = {
  blue: "bg-blue-50 text-signal-blue",
  teal: "bg-teal-50 text-signal-teal",
  amber: "bg-amber-50 text-signal-amber",
  red: "bg-red-50 text-signal-red",
  green: "bg-green-50 text-signal-green"
};

export function MetricCard({ label, value, detail, tone = "blue" }: MetricCardProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-surface-raised p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
        </div>
        <div className={`rounded-md px-2.5 py-1 text-xs font-semibold ${toneClassNames[tone]}`}>
          Live
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-muted">{detail}</p>
    </section>
  );
}
