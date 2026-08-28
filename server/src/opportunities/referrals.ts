import { prisma } from "../lib/prisma.js";
import { COMMERCIAL_INDEPENDENCE_STATEMENT } from "./provenance.js";

export const DEFAULT_REFERRAL_DISCLOSURE =
  "Happy Tasking may earn a commission if you join through this link. This does not affect your pay or our company scores.";

export type ReferralResolution = {
  url: string | null;
  usedReferral: boolean;
  programName: string | null;
  campaign: string | null;
  disclosure: string | null;
  originalApplicationUrl: string | null;
};

/**
 * Referral destinations never override provenance URLs. Missing programs
 * fall back to the original official application URL.
 */
export async function resolveApplicationDestination(input: {
  companyId: string;
  opportunityId?: string | null;
  originalApplicationUrl: string | null;
}): Promise<ReferralResolution> {
  const original = input.originalApplicationUrl;
  const destination = await prisma.referralDestination.findFirst({
    where: {
      active: true,
      companyId: input.companyId,
      OR: input.opportunityId
        ? [{ opportunityId: input.opportunityId }, { opportunityId: null }]
        : [{ opportunityId: null }],
      program: {
        authorized: true,
        status: "ACTIVE",
      },
    },
    include: { program: true },
    orderBy: [{ opportunityId: "desc" }, { updatedAt: "desc" }],
  });

  if (!destination) {
    return {
      url: original,
      usedReferral: false,
      programName: null,
      campaign: null,
      disclosure: null,
      originalApplicationUrl: original,
    };
  }

  return {
    url: destination.referralUrl,
    usedReferral: true,
    programName: destination.program.programName,
    campaign: destination.campaign,
    disclosure: destination.program.disclosure || DEFAULT_REFERRAL_DISCLOSURE,
    originalApplicationUrl: original,
  };
}

export function referralDoesNotAffectIntelligence() {
  return COMMERCIAL_INDEPENDENCE_STATEMENT;
}
