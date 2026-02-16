type StatusPillProps = {
  label: string;
  tone?: "blue" | "green" | "amber" | "red" | "gray";
};

const toneClassNames = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  gray: "border-slate-200 bg-slate-50 text-slate-700"
};

export function StatusPill({ label, tone = "gray" }: StatusPillProps) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${toneClassNames[tone]}`}>
      {label}
    </span>
  );
}
