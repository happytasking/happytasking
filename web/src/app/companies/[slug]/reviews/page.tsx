"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Old bookmark: send people to the in-page Reviews tab. */
export default function CompanyReviewsRedirect() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/companies/${params.slug}?tab=reviews`);
  }, [params.slug, router]);

  return null;
}
