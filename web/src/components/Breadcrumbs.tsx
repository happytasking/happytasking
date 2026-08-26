import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <JsonLd data={breadcrumbJsonLd(items)} />
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.path}-${item.name}`} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-subtle">
                  /
                </span>
              )}
              {last ? (
                <span className="text-foreground" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-accent hover:underline">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
