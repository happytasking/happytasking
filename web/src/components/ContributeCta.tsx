"use client";

import Link from "next/link";
import { track } from "@/lib/track";

type Props = {
  className?: string;
  label?: string;
};

export function ContributeCta({
  className = "btn btn-accent min-h-11",
  label = "Contribute",
}: Props) {
  return (
    <Link
      href="/open-source"
      className={className}
      onClick={() => track("contribute_clicked")}
    >
      {label}
    </Link>
  );
}
