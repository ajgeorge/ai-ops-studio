type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-6 shadow-panel">
      <p className="text-sm font-medium text-ink-muted">Feature slice</p>
      <h2 className="mt-1 text-2xl font-semibold text-ink">{title}</h2>
      <div className="mt-5 h-2 rounded-full bg-surface-muted">
        <div className="h-2 w-1/4 rounded-full bg-signal-teal" />
      </div>
    </section>
  );
}
