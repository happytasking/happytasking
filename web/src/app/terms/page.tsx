import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community terms",
  description:
    "How to use Happy Tasking: share experience, not confidential work. Full legal terms of service are being prepared.",
};

export default function TermsPage() {
  return (
    <div className="container-page max-w-2xl space-y-8">
      <header>
        <p className="eyebrow">Legal</p>
        <h1 className="page-title mt-1">Community terms</h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">
          A full terms-of-service document is being prepared. Until then, using
          Happy Tasking means agreeing to these community rules.
        </p>
      </header>

      <ul className="space-y-3 text-sm leading-relaxed text-muted">
        <li>
          Share your experience, not confidential work. Do not post project
          names, prompts, answers, internal guidelines, client identities, or
          NDA-protected material.
        </li>
        <li>
          Do not fabricate reviews, pulse reports, or company data. Corrections
          belong in a data-correction report, not a fake score.
        </li>
        <li>
          Treat other contributors and company representatives professionally.
          Harassment is not debate.
        </li>
        <li>
          Public reputation on Happy Tasking is not for sale. Do not offer or
          request payment to change a score, bury an issue, or plant a review.
        </li>
      </ul>

      <p className="text-sm text-muted">
        Privacy practices:{" "}
        <Link href="/privacy-for-contributors" className="font-semibold text-accent hover:underline">
          Privacy for contributors
        </Link>
        . Conduct:{" "}
        <Link href="/open-source" className="font-semibold text-accent hover:underline">
          community project
        </Link>
        .
      </p>
    </div>
  );
}
