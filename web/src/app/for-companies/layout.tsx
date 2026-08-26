import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = publicPageMetadata({
  path: "/for-companies",
  title: "For AI work companies",
  description:
    "Claim your Happy Tasking profile and answer contributors in public. Scores are not for sale. Verification gives a company a public voice on issues.",
});

export default function ForCompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "For companies", path: "/for-companies" },
          ]}
        />
      </div>
      {children}
    </>
  );
}
