import { prisma } from "../lib/prisma.js";
import { parseCountryLocation } from "./country.js";
import { resolveCompanyLogoUrl } from "./logos.js";

function sameCodes(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((code, i) => code === right[i]);
}

export async function backfillCountryEligibilityFromStoredLocations() {
  const rows = await prisma.opportunity.findMany({
    where: { isDemo: false },
    select: {
      id: true,
      locationText: true,
      remoteType: true,
      countryEligibility: true,
      countryRestrictions: true,
    },
  });
  let updated = 0;
  for (const row of rows) {
    const parsed = parseCountryLocation(
      row.locationText,
      row.remoteType === "REMOTE",
    );
    if (
      parsed.eligibility === row.countryEligibility &&
      sameCodes(parsed.codes, row.countryRestrictions)
    ) {
      continue;
    }
    await prisma.opportunity.update({
      where: { id: row.id },
      data: {
        countryEligibility: parsed.eligibility,
        countryRestrictions: parsed.codes,
      },
    });
    updated += 1;
  }
  return { scanned: rows.length, updated };
}

export async function backfillCompanyLogos() {
  const companies = await prisma.company.findMany({
    where: { isDemo: false },
    select: { id: true, slug: true, website: true, logoUrl: true },
  });
  let updated = 0;
  for (const company of companies) {
    const logoUrl = resolveCompanyLogoUrl({
      slug: company.slug,
      existing: company.logoUrl,
      website: company.website,
    });
    if (!logoUrl || logoUrl === company.logoUrl) continue;
    await prisma.company.update({
      where: { id: company.id },
      data: { logoUrl },
    });
    updated += 1;
  }
  return { scanned: companies.length, updated };
}
