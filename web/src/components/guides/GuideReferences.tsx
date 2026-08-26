import type { GuideSource } from "@/lib/guideSeo";

export function GuideReferences({ sources }: { sources: GuideSource[] }) {
  if (sources.length === 0) return null;
  return (
    <section className="panel panel-pad space-y-3">
      <h2 className="section-title">Sources</h2>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
        {sources.map((source) => (
          <li key={`${source.title}-${source.url || ""}`}>
            {source.url ? (
              <a
                href={source.url}
                className="font-semibold text-accent hover:underline"
                rel="noreferrer"
                target="_blank"
              >
                {source.title}
              </a>
            ) : (
              <span>{source.title}</span>
            )}
            {source.kind === "community" ? (
              <span className="text-subtle"> — community-reported</span>
            ) : null}
            {source.kind === "official" ? (
              <span className="text-subtle"> — official / public</span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
