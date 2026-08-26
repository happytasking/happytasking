import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Company not found",
  description: "This company profile is not on Happy Tasking.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: {
    title: "Company not found",
    description: "This company profile is not on Happy Tasking.",
  },
};

export default function CompanyNotFound() {
  return (
    <div className="container-page max-w-xl space-y-4">
      <p className="eyebrow">404</p>
      <h1 className="page-title">Company not found</h1>
      <p className="text-sm leading-relaxed text-muted">
        There is no public company at this URL. That is a missing page, not an
        empty scorecard.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/companies" className="btn btn-primary min-h-11">
          Company directory
        </Link>
        <Link href="/" className="btn btn-secondary min-h-11">
          Home
        </Link>
      </div>
    </div>
  );
}
