import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";
import { robotsDisallowPaths } from "@/lib/indexability";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: robotsDisallowPaths(),
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  };
}
