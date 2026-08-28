import { prisma } from "../lib/prisma.js";

export const PLATFORM_SLUG_ALIASES: Record<string, string> = {
  micro1: "micro1",
  afterquery: "afterquery",
  braintrust: "braintrust",
  mercor: "mercor",
  alignerr: "alignerr",
  xai: "xai",
  "invisible-technologies": "invisible-technologies",
  invisible: "invisible-technologies",
  terac: "terac",
  "sigma-ai": "sigma-ai",
  "transperfect-dataforce": "transperfect-dataforce",
  appen: "appen",
  mindrift: "mindrift",
  "outlier-scale-ai": "outlier",
  outlier: "outlier",
  remotasks: "remotasks",
  "handshake-ai": "handshake-ai",
  dataannotation: "dataannotation",
  prolific: "prolific",
};

const WORK_TYPE_DOMAIN: Record<string, string> = {
  coding: "coding",
  "stem-math": "science",
  "domain-expert": "other",
  "rlhf-eval": "generalist",
  "data-labeling": "data-annotation",
  writing: "writing",
  multilingual: "translation",
  "audio-speech": "other",
  "red-teaming": "research",
  "agentic-eval": "coding",
  "research-studies": "research",
};

function slugifyName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function canonicalCompanySlug(hint: string, name: string) {
  return PLATFORM_SLUG_ALIASES[hint.toLowerCase()] || slugifyName(hint || name);
}

export async function resolveCompany(input: {
  slugHint: string;
  name: string;
  website?: string | null;
}) {
  const slug = canonicalCompanySlug(input.slugHint, input.name);
  const existing = await prisma.company.findUnique({ where: { slug } });
  if (existing) {
    if (existing.isDemo) {
      return prisma.company.update({
        where: { id: existing.id },
        data: {
          isDemo: false,
          website: existing.website || input.website || existing.website,
        },
      });
    }
    return existing;
  }
  const description = `${input.name} is an AI-training work platform tracked by Happy Tasking. Commercial relationships do not influence Happy Tasking's independent company intelligence.`;
  return prisma.company.create({
    data: {
      slug,
      name: input.name,
      description,
      website: input.website,
      isDemo: false,
      companyStatus: "ACTIVE",
    },
  });
}

export async function resolveDomainId(workType: string | null | undefined) {
  const slug = WORK_TYPE_DOMAIN[workType || ""] || "generalist";
  const domain = await prisma.domain.findUnique({ where: { slug } });
  return domain?.id ?? null;
}
