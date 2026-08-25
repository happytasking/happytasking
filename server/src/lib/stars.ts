/**
 * Maps a 0–100 score onto 0–5 stars.
 * 0–10 → 0, 11–30 → 1, 31–50 → 2, 51–70 → 3, 71–90 → 4, 91–100 → 5
 * using round(score / 20), then clamping.
 */
export function scoreToStars(score0to100: number | null | undefined): number | null {
  if (score0to100 == null || Number.isNaN(score0to100)) return null;
  return Math.max(0, Math.min(5, Math.round(score0to100 / 20)));
}
