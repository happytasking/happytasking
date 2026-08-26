import type { MetadataRoute } from "next";
import {
  loadIndexableLists,
  mapSitemapEntries,
  staticSitemapEntries,
} from "@/lib/indexability";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicLists = await loadIndexableLists();

  const companies = mapSitemapEntries(
    dynamicLists.companies,
    (slug) => `/companies/${slug}`,
    0.8,
    "weekly",
  );
  const skills = mapSitemapEntries(
    dynamicLists.skills,
    (slug) => `/skills/${slug}`,
    0.7,
    "weekly",
  );
  const opportunities = mapSitemapEntries(
    dynamicLists.opportunities,
    (slug) => `/taskmatch/opportunities/${slug}`,
    0.7,
    "weekly",
  );
  const comparisons = mapSitemapEntries(
    dynamicLists.comparisons,
    (slug) => `/compare/${slug}`,
    0.7,
    "weekly",
  );

  return [
    ...staticSitemapEntries(),
    ...companies,
    ...skills,
    ...opportunities,
    ...comparisons,
  ];
}
