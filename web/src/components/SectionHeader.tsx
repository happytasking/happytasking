import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  right?: React.ReactNode;
  heading?: "h2" | "h3";
};

export function SectionHeader({
  title,
  description,
  actionHref,
  actionLabel,
  right,
  heading = "h2",
}: Props) {
  const Heading = heading;
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <Heading className="section-title">{title}</Heading>
        {description && (
          <p className="mt-0.5 text-[0.8125rem] text-muted">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {right}
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="text-[0.8125rem] font-semibold text-accent hover:underline"
          >
            {actionLabel} →
          </Link>
        )}
      </div>
    </div>
  );
}
