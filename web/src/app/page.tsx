import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { loadHomePage } from "@/lib/publicPages";
import { siteUrl } from "@/lib/site";
import HomePage from "./HomePage";

export const revalidate = 120;

export const metadata: Metadata = publicPageMetadata({
  path: "/",
  absoluteTitle: "Happy Tasking — Know before you task.",
  description:
    "Independent reputation, community, and market intelligence for the AI work economy. Compare companies, pay, task availability, and contributor experiences. Know before you task.",
});

export default async function Page() {
  const initial = await loadHomePage();
  return (
    <>
      {/* Next.js strips the trailing slash from origin-only metadata canonicals. */}
      <link rel="canonical" href={siteUrl("/")} />
      <HomePage initial={initial} />
    </>
  );
}
