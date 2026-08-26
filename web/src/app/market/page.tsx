import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { loadMarketPage } from "@/lib/publicPages";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import MarketPage from "./MarketPage";

export const revalidate = 120;

export const metadata: Metadata = publicPageMetadata({
  path: "/market",
  title: "AI Work Market",
  description:
    "Pay, demand, stability, and sentiment aggregated from structured contributor reports across tracked AI work companies.",
});

export default async function Page() {
  const initial = await loadMarketPage();
  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Market", path: "/market" },
          ]}
        />
      </div>
      <MarketPage initial={initial} />
    </>
  );
}
