import { formatMoney } from "./format";

export type PayLike = {
  minRate?: number | null;
  maxRate?: number | null;
  currency?: string | null;
  rateUnit?: string | null;
};

function unitCopy(rateUnit?: string | null) {
  if (rateUnit === "PER_TASK") return { short: "/task", long: "per task" };
  if (rateUnit === "MILESTONE") return { short: "/milestone", long: "per milestone" };
  return { short: "/hr", long: "per hour" };
}

export function opportunityPay(item: PayLike) {
  if (item.minRate == null && item.maxRate == null) return null;
  const currency = item.currency || "USD";
  const low = item.minRate ?? item.maxRate;
  const high = item.maxRate;
  const same = high == null || low == null || high === low;
  const amount = same
    ? formatMoney(low, currency)
    : `${formatMoney(low, currency)}–${formatMoney(high, currency)}`;
  const unit = unitCopy(item.rateUnit);
  const aria = same
    ? `${formatMoney(low, currency)} ${unit.long}`
    : `${formatMoney(low, currency)} to ${formatMoney(high, currency)} ${unit.long}`;
  return { amount, unit: unit.long, shortUnit: unit.short, aria };
}
