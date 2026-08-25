import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  legend?: ReactNode;
  footnote?: string;
  children: ReactNode;
  className?: string;
};

export default function ChartCard({
  title,
  subtitle,
  action,
  legend,
  footnote,
  children,
  className = "",
}: Props) {
  return (
    <section className={`panel panel-pad ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="section-title">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[0.8125rem] muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {legend && <div className="mt-3">{legend}</div>}
      <div className="mt-4">{children}</div>
      {footnote && (
        <p className="mt-3 text-[0.71875rem] text-[color:var(--subtle)]">{footnote}</p>
      )}
    </section>
  );
}

export function ChartLegend({
  items,
}: {
  items: { name: string; color: string; dashed?: boolean }[];
}) {
  return (
    <ul className="chart-legend">
      {items.map((item) => (
        <li key={item.name} className="chart-legend-item">
          <span
            className="chart-swatch"
            style={
              item.dashed
                ? {
                    background: `repeating-linear-gradient(90deg, ${item.color} 0 3px, transparent 3px 6px)`,
                  }
                : { background: item.color }
            }
          />
          {item.name}
        </li>
      ))}
    </ul>
  );
}

export function ChartEmpty({ message = "Not enough data yet" }: { message?: string }) {
  return (
    <div className="flex h-[11.25rem] flex-col items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-2)] text-center">
      <p className="text-sm font-semibold">{message}</p>
      <p className="mt-1 text-xs muted">
        Charts appear once enough reports are collected.
      </p>
    </div>
  );
}
