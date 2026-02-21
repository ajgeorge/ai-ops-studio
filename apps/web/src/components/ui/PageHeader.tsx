import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  return (
    <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="text-sm font-medium text-ink-muted">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-semibold text-ink">{title}</h2>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </section>
  );
}
