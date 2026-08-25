import Link from "next/link";

type Props = {
  className?: string;
};

/** Short, reusable reminder used on reviews, issues, and community forms. */
export function ConfidentialityNote({ className = "" }: Props) {
  return (
    <p
      className={`rounded-[var(--radius)] bg-accent-soft px-4 py-3 text-sm font-semibold leading-relaxed text-accent ${className}`}
    >
      Share your experience, not confidential work.{" "}
      <Link
        href="/privacy-for-contributors"
        className="underline decoration-transparent hover:decoration-current"
      >
        What stays off this site
      </Link>
    </p>
  );
}
