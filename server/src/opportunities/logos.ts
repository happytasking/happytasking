export const KNOWN_COMPANY_WEBSITES: Record<string, string> = {
  appen: "https://appen.com",
  "invisible-technologies": "https://www.invisibletech.ai",
  outlier: "https://outlier.ai",
  remotasks: "https://www.remotasks.com",
  prolific: "https://www.prolific.com",
  dataannotation: "https://www.dataannotation.tech",
  mercor: "https://mercor.com",
  micro1: "https://www.micro1.ai",
  afterquery: "https://afterquery.com",
  "sigma-ai": "https://sigma.ai",
  xai: "https://x.ai",
  "transperfect-dataforce": "https://www.transperfect.com/dataforce",
  mindrift: "https://mindrift.ai",
  terac: "https://terac.ai",
  alignerr: "https://alignerr.com",
  "handshake-ai": "https://handshake.ai",
  braintrust: "https://www.usebraintrust.com",
};

const CURATED_LOGOS: Record<string, string> = {
  appen: "/logos/appen.svg",
  "invisible-technologies": "/logos/invisible-technologies.svg",
  outlier: "/logos/outlier.svg",
  remotasks: "/logos/remotasks.svg",
  prolific: "/logos/prolific.svg",
  dataannotation: "/logos/dataannotation.svg",
  "scale-ai": "/logos/scale-ai.svg",
  "surge-ai": "/logos/surge-ai.svg",
  labelbox: "/logos/labelbox.svg",
  "snorkel-ai": "/logos/snorkel-ai.svg",
  superannotate: "/logos/superannotate.svg",
  "telus-international-ai": "/logos/telus-international-ai.svg",
  toloka: "/logos/toloka.svg",
};

export function curatedCompanyLogo(slug: string): string | null {
  return CURATED_LOGOS[slug] ?? null;
}

export function faviconLogoUrl(website: string | null | undefined): string | null {
  if (!website) return null;
  try {
    const host = new URL(
      website.startsWith("http") ? website : `https://${website}`,
    ).hostname.replace(/^www\./, "");
    if (!host || host === "localhost") return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return null;
  }
}

export function resolveCompanyWebsite(
  slug: string,
  website?: string | null,
): string | null {
  return website || KNOWN_COMPANY_WEBSITES[slug] || null;
}

export function resolveCompanyLogoUrl(input: {
  slug: string;
  existing?: string | null;
  website?: string | null;
}): string | null {
  if (input.existing) return input.existing;
  const website = resolveCompanyWebsite(input.slug, input.website);
  return curatedCompanyLogo(input.slug) || faviconLogoUrl(website);
}
