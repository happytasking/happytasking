import type { OpportunityCard } from "@/lib/types";

export function hasPublicCommunityIntelligence(item: OpportunityCard): boolean {
  if (item.isDemo || item.company.isDemo) return false;
  if (item.opportunityQuality.insufficient) {
    return item.taskScore != null || Boolean(item.pulse.availability);
  }
  return (
    item.taskScore != null ||
    Boolean(item.pulse.availability) ||
    item.opportunityQuality.score != null
  );
}
