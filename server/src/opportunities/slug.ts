import { createHash } from "node:crypto";
import slugify from "slugify";

/** Stable public opportunity slug. Includes a hash of the full external id so
 * two listings with the same title cannot collide on a truncated id prefix. */
export function uniqueOpportunitySlug(
  companySlug: string,
  title: string,
  externalId: string,
) {
  const base = slugify(`${companySlug}-${title}`, { lower: true, strict: true }).slice(
    0,
    120,
  );
  const idPart = createHash("sha256")
    .update(externalId)
    .digest("hex")
    .slice(0, 12);
  const stem = base || "opportunity";
  return `${stem}-${idPart}`.slice(0, 180);
}
