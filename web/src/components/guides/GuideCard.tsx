import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Guide } from "@/lib/guides";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article className="panel panel-pad space-y-2">
      <p className="eyebrow">{guide.category}</p>
      <h3 className="text-lg font-semibold leading-snug">
        <Link
          href={`/guides/${guide.slug}`}
          className="hover:text-accent hover:underline"
        >
          {guide.title}
        </Link>
      </h3>
      <p className="text-sm leading-relaxed text-muted">{guide.excerpt}</p>
      <p className="text-xs text-subtle">
        Updated {formatDate(guide.dateModified)}
        {guide.readingTime ? ` · ${guide.readingTime} min read` : ""}
      </p>
    </article>
  );
}
