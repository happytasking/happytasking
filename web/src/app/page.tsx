import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";
import { loadHomePage } from "@/lib/publicPages";
import HomePage from "./HomePage";

export const revalidate = 120;

export const metadata: Metadata = {
  description:
    "Independent reputation, community, and market intelligence for the AI work economy. Compare companies, pay, task availability, and contributor experiences. Know before you task.",
  ...canonicalMetadata("/"),
};

export default async function Page() {
  const initial = await loadHomePage();
  return <HomePage initial={initial} />;
}
