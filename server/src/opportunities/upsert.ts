import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { resolveCompany, resolveDomainId } from "./companyResolve.js";
import { canonicalApplicationKey } from "./fingerprint.js";
import { provenanceLabels } from "./provenance.js";
import { uniqueOpportunitySlug } from "./slug.js";
import type { NormalizedOpportunity, SourceMetrics } from "./types.js";
import { EMPTY_SOURCE_METRICS } from "./types.js";

function uniqueTargets(error: Prisma.PrismaClientKnownRequestError): string[] {
  const target = error.meta?.target;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === "string") return [target];
  return [];
}

async function allocateSlug(companySlug: string, title: string, externalId: string) {
  const base = uniqueOpportunitySlug(companySlug, title, externalId);
  let candidate = base;
  for (let n = 2; n < 50; n += 1) {
    const taken = await prisma.opportunity.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
    candidate = `${base}-${n}`.slice(0, 180);
  }
  throw new Error(`Could not allocate a unique slug for ${companySlug} ${title}`);
}

async function findDuplicate(record: NormalizedOpportunity, companyId: string) {
  const byExternal = await prisma.opportunity.findFirst({
    where: { sourceKey: record.sourceKey, externalId: record.externalId },
  });
  if (byExternal) return { row: byExternal, reason: "external-id" as const };

  if (record.originalApplicationUrl) {
    const byExactUrl = await prisma.opportunity.findFirst({
      where: {
        isDemo: false,
        originalApplicationUrl: record.originalApplicationUrl,
      },
    });
    if (byExactUrl) return { row: byExactUrl, reason: "application-url" as const };
  }

  const canonical = canonicalApplicationKey(record.originalApplicationUrl);
  if (canonical) {
    const hostPath = canonical.split("://")[1] || canonical;
    const byUrl = await prisma.opportunity.findFirst({
      where: {
        isDemo: false,
        OR: [
          { originalApplicationUrl: { contains: hostPath } },
          { primarySourceUrl: { contains: hostPath } },
          { applicationUrl: { contains: hostPath } },
        ],
      },
    });
    if (byUrl) return { row: byUrl, reason: "application-url" as const };
  }

  const byFingerprint = await prisma.opportunity.findFirst({
    where: { companyId, fingerprint: record.fingerprint, isDemo: false },
  });
  if (byFingerprint) return { row: byFingerprint, reason: "fingerprint" as const };
  return null;
}

export async function upsertNormalizedOpportunities(
  records: NormalizedOpportunity[],
  now = new Date(),
): Promise<SourceMetrics> {
  const metrics: SourceMetrics = { ...EMPTY_SOURCE_METRICS };
  const seen = new Set<string>();

  for (const record of records) {
    metrics.parsed += 1;
    if (record.relevance.status === "REJECTED") {
      metrics.rejected += 1;
      continue;
    }
    if (record.relevance.status === "QUARANTINED") {
      metrics.quarantined += 1;
      continue;
    }
    metrics.valid += 1;
    if (seen.has(record.externalId)) {
      metrics.duplicates += 1;
      continue;
    }

    const company = await resolveCompany({
      slugHint: record.companySlugHint,
      name: record.companyName,
      website: record.companyWebsite,
    });
    const labels = provenanceLabels({
      discoverySource: record.discoverySource,
      primary: record.primary,
    });
    const duplicate = await findDuplicate(record, company.id);
    const domainId = await resolveDomainId(record.workType);
    const applicationUrl =
      record.originalApplicationUrl || record.rawDiscoveryApplicationUrl;
    const sourceUrl = record.primary.canonicalUrl || record.discoveryUrl;
    const publishedAt = record.postedAt;
    const payload = {
      companyId: company.id,
      title: record.title,
      summary: record.summary,
      description: record.summary,
      status: "ACTIVE" as const,
      sourceType: labels.sourceType,
      sourceKey: record.sourceKey,
      sourceUrl,
      externalId: record.externalId,
      fingerprint: record.fingerprint,
      discoverySource: record.discoverySource,
      discoveryUrl: record.discoveryUrl,
      primarySource: record.primary.official
        ? record.companyName
        : record.discoverySource,
      primarySourceUrl: record.primary.canonicalUrl,
      originalApplicationUrl: record.originalApplicationUrl,
      rawDiscoveryApplicationUrl: record.rawDiscoveryApplicationUrl,
      countryRestrictions: record.country.codes,
      countryEligibility: record.country.eligibility,
      locationText: record.locationText,
      remoteType: record.remote ? ("REMOTE" as const) : ("ONSITE" as const),
      paymentModel: "HOURLY" as const,
      currency: record.pay.currency,
      minRate: record.pay.minRate,
      maxRate: record.pay.maxRate,
      rateUnit: record.pay.unit ?? "HOURLY",
      applicationUrl,
      workType: record.workType,
      relevanceStatus: record.relevance.status,
      relevanceReason: record.relevance.reason,
      isDemo: false,
      publishedAt,
      lastSeenAt: now,
      lastVerifiedAt: now,
    };

    if (duplicate) {
      metrics.duplicates += 1;
      const prev = duplicate.row;
      const changed =
        prev.title !== record.title ||
        prev.minRate !== record.pay.minRate ||
        prev.maxRate !== record.pay.maxRate ||
        prev.status !== "ACTIVE";
      await prisma.opportunity.update({
        where: { id: prev.id },
        data: {
          ...payload,
          firstSeenAt: prev.firstSeenAt ?? now,
          publishedAt: prev.publishedAt ?? publishedAt,
          sourceType:
            labels.sourceType === "PUBLIC_LISTING" || prev.sourceType === "PUBLIC_LISTING"
              ? "PUBLIC_LISTING"
              : payload.sourceType,
        },
      });
      if (changed) metrics.updated += 1;
      else metrics.unchanged += 1;
      seen.add(record.externalId);
      continue;
    }

    const slug = await allocateSlug(company.slug, record.title, record.externalId);
    try {
      await prisma.opportunity.create({
        data: {
          ...payload,
          slug,
          firstSeenAt: now,
          domains: domainId ? { create: [{ domainId }] } : undefined,
        },
      });
    } catch (error) {
      const conflict =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!conflict) throw error;
      const targets = uniqueTargets(error);
      if (targets.some((t) => t.includes("externalId") || t.includes("sourceKey"))) {
        const existing = await prisma.opportunity.findFirst({
          where: { sourceKey: record.sourceKey, externalId: record.externalId },
        });
        if (existing) {
          metrics.duplicates += 1;
          const changed =
            existing.title !== record.title ||
            existing.minRate !== record.pay.minRate ||
            existing.maxRate !== record.pay.maxRate ||
            existing.status !== "ACTIVE";
          await prisma.opportunity.update({
            where: { id: existing.id },
            data: {
              ...payload,
              firstSeenAt: existing.firstSeenAt ?? now,
              publishedAt: existing.publishedAt ?? publishedAt,
              sourceType:
                labels.sourceType === "PUBLIC_LISTING" ||
                existing.sourceType === "PUBLIC_LISTING"
                  ? "PUBLIC_LISTING"
                  : payload.sourceType,
            },
          });
          if (changed) metrics.updated += 1;
          else metrics.unchanged += 1;
          seen.add(record.externalId);
          continue;
        }
      }
      const retrySlug = await allocateSlug(
        company.slug,
        `${record.title}-listing`,
        `${record.externalId}-retry`,
      );
      await prisma.opportunity.create({
        data: {
          ...payload,
          slug: retrySlug,
          firstSeenAt: now,
          domains: domainId ? { create: [{ domainId }] } : undefined,
        },
      });
    }
    metrics.created += 1;
    seen.add(record.externalId);
  }

  return metrics;
}

export function seenExternalIds(records: NormalizedOpportunity[]) {
  return new Set(
    records.filter((r) => r.relevance.status === "ACCEPTED").map((r) => r.externalId),
  );
}
