import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";
import { loadMarketPage } from "@/lib/publicPages";
import MarketPage from "./MarketPage";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "AI Work Market",
  description:
    "Pay, demand, stability, and sentiment aggregated from structured contributor reports across tracked AI work companies.",
  ...canonicalMetadata("/market"),
};

export default async function Page() {
  const initial = await loadMarketPage();
  return <MarketPage initial={initial} />;
}
