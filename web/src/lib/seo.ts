import type { Metadata } from "next";
import { SITE_ORIGIN, siteUrl } from "./site";
import { GITHUB_REPO } from "./github";

export const SITE_NAME = "Happy Tasking";
export const SITE_TAGLINE = "Know before you task.";
export const SITE_DESCRIPTION =
  "Independent reputation, community, and market intelligence for the AI work economy. Know before you task.";

const OG_IMAGE = {
  url: "/brand/og-image.jpg",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
};

export type PublicPageMeta = {
  path: string;
  title?: string;
  absoluteTitle?: string;
  description: string;
  /** Default true. Demo/private/empty resources pass false. */
  index?: boolean;
  follow?: boolean;
};

/**
 * Canonical + Open Graph + Twitter in one place so a page title cannot stay
 * stuck on the homepage card.
 */
export function publicPageMetadata({
  path,
  title,
  absoluteTitle,
  description,
  index = true,
  follow = true,
}: PublicPageMeta): Metadata {
  const canonical = siteUrl(path);
  const isHome = path === "/" || path === "";
  const displayTitle =
    absoluteTitle || title || `${SITE_NAME} — ${SITE_TAGLINE}`;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    // Next.js strips the trailing slash from origin-only canonicals. The
    // homepage emits <link rel="canonical"> itself so it stays
    // https://happytasking.com/
    alternates: isHome ? undefined : { canonical },
    robots: { index, follow },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      title: displayTitle,
      description,
      url: canonical,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

/** Private surfaces should not inherit a public parent's canonical. */
export function privatePageMetadata(): Metadata {
  return {
    title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
    description: SITE_DESCRIPTION,
    alternates: { canonical: null },
    robots: { index: false, follow: false },
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: undefined,
    },
    twitter: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    description: SITE_DESCRIPTION,
    logo: siteUrl("/brand/logo-mark-192.png"),
    sameAs: [GITHUB_REPO],
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    name: SITE_NAME,
    alternateName: SITE_TAGLINE,
    url: SITE_ORIGIN,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_ORIGIN}/companies?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function siteGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationJsonLd(), websiteJsonLd()],
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  };
}
