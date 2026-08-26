export const MIN_SITEMAP_DESCRIPTION_CHARS = 40;

/** Non-demo companies still need unique public content before they are indexed. */
export function companyHasIndexableContent(row: {
  description: string;
  reviews: number;
  payReports: number;
  availabilityReports: number;
  opportunities: number;
  complaints: number;
}): boolean {
  return (
    row.description.trim().length >= MIN_SITEMAP_DESCRIPTION_CHARS ||
    row.reviews > 0 ||
    row.payReports > 0 ||
    row.availabilityReports > 0 ||
    row.opportunities > 0 ||
    row.complaints > 0
  );
}
