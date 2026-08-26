import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This Happy Tasking URL does not exist.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: {
    title: "Page not found",
    description: "This Happy Tasking URL does not exist.",
  },
};

export default function NotFound() {
  return (
    <div className="container-page max-w-xl space-y-4">
      <p className="eyebrow">404</p>
      <h1 className="page-title">Page not found</h1>
      <p className="text-sm leading-relaxed text-muted">
        This address is not a Happy Tasking page. It is not an empty directory
        and it is not a data outage.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/" className="btn btn-primary min-h-11">
          Home
        </Link>
        <Link href="/companies" className="btn btn-secondary min-h-11">
          Company directory
        </Link>
      </div>
    </div>
  );
}
