import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef } from "react";

function OfficialNote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-4 rounded-lg border border-border bg-surface-2 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
        Public / official information
      </p>
      <div className="mt-1 text-sm text-muted">{children}</div>
    </aside>
  );
}

function CommunityNote({
  children,
  sample,
  window,
}: {
  children: React.ReactNode;
  sample?: number;
  window?: string;
}) {
  return (
    <aside className="my-4 rounded-lg border border-border bg-surface-2 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
        Community-reported data
      </p>
      <div className="mt-1 text-sm text-muted">{children}</div>
      {(sample || window) && (
        <p className="mt-2 text-xs text-subtle">
          {sample ? `Based on ${sample} reports` : null}
          {sample && window ? " · " : null}
          {window || null}
        </p>
      )}
    </aside>
  );
}

const components = {
  OfficialNote,
  CommunityNote,
  a: (props: ComponentPropsWithoutRef<"a">) => {
    const href = props.href || "";
    const external = href.startsWith("http");
    if (external) {
      return (
        <a
          {...props}
          className="font-semibold text-accent hover:underline"
          rel="noreferrer"
          target="_blank"
        />
      );
    }
    return (
      <Link href={href} className="font-semibold text-accent hover:underline">
        {props.children}
      </Link>
    );
  },
  img: (props: ComponentPropsWithoutRef<"img">) => {
    if (!props.alt?.trim()) return null;
    return (
      // MDX authors supply alt; empty alt is dropped above.
      // eslint-disable-next-line @next/next/no-img-element
      <img {...props} alt={props.alt} className="h-auto max-w-full rounded-lg" />
    );
  },
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="table-wrap">
      <table {...props} className="table" />
    </div>
  ),
};

export async function GuideMdx({ source }: { source: string }) {
  return (
    <div className="guide-body">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
