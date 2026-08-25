import Link from "next/link";

type Item = { key: string; label: string; done: boolean };

export function ProfileStrength({
  percent,
  items,
}: {
  percent: number;
  items: Item[];
}) {
  return (
    <section className="panel panel-pad space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Your profile strength</p>
          <p className="num mt-1 text-3xl font-semibold">{percent}%</p>
        </div>
        <Link href="/taskmatch/profile" className="btn btn-secondary min-h-11">
          Improve profile
        </Link>
      </div>
      <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.key} className={item.done ? "" : "text-muted"}>
            {item.done ? "✓" : "○"} {item.label}
          </li>
        ))}
      </ul>
      {percent < 100 && (
        <p className="text-sm text-muted">
          Add a few more details to improve your matches.
        </p>
      )}
    </section>
  );
}
