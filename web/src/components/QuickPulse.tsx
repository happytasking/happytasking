"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { AvailabilityPill } from "./AvailabilityPill";
import type { QuickPulseResult, TaskPulse } from "@/lib/types";

const OPTIONS: { value: "HIGH" | "MODERATE" | "LOW" | "NO_TASKS"; label: string; tone: string }[] =
  [
    { value: "HIGH", label: "High", tone: "🟢" },
    { value: "MODERATE", label: "Moderate", tone: "🟡" },
    { value: "LOW", label: "Low", tone: "🟠" },
    { value: "NO_TASKS", label: "No tasks", tone: "⚪" },
  ];

type Props = {
  companySlug: string;
  companyName: string;
  domainId?: string;
  domainName?: string;
  source?: "onboarding" | "quick_pulse" | "form";
  compact?: boolean;
  onSubmitted?: (result: QuickPulseResult) => void;
};

export function QuickPulse({
  companySlug,
  companyName,
  domainId,
  domainName,
  source = "quick_pulse",
  compact = false,
  onSubmitted,
}: Props) {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [result, setResult] = useState<QuickPulseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(status: "HIGH" | "MODERATE" | "LOW" | "NO_TASKS") {
    setSubmitting(status);
    setError(null);
    try {
      const data = await api<QuickPulseResult>("/market/availability-reports", {
        method: "POST",
        body: {
          companySlug,
          domainId,
          availabilityStatus: status,
          source,
        },
      });
      setResult(data);
      onSubmitted?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSubmitting(null);
    }
  }

  if (result) {
    const pulse: TaskPulse = result.pulse;
    return (
      <div className="rounded-[var(--radius)] border border-border bg-surface-2 px-3 py-3">
        <p className="text-sm font-medium">Thanks — your report updated TaskPulse.</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-subtle">
          {companyName}
          {domainName ? ` / ${domainName}` : ""}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">
            Community reports this week:{" "}
            <span className="num font-semibold text-foreground">
              {pulse.sampleSize}
            </span>
          </span>
          <AvailabilityPill status={pulse.availability} trend={pulse.trend} />
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div>
        <p className="text-sm font-semibold">
          How is work availability at {companyName} today?
        </p>
        {domainName && (
          <p className="hint">Based on your {domainName} experience.</p>
        )}
        <p className="hint">
          This anonymous signal helps power TaskPulse. Optional.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className="choice-card min-h-12"
            disabled={!!submitting}
            onClick={() => void submit(opt.value)}
          >
            <span>
              {opt.tone} {opt.label}
            </span>
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-[var(--low)]">{error}</p>}
    </div>
  );
}
