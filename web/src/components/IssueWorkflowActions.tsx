"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { humanize } from "@/lib/format";
import type { Issue, ResolutionOutcome } from "@/lib/types";

const OUTCOMES: { value: ResolutionOutcome; label: string; hint: string }[] = [
  { value: "RESOLVED", label: "Resolved", hint: "The outcome I asked for happened" },
  {
    value: "PARTIALLY_RESOLVED",
    label: "Partially resolved",
    hint: "Some of it was addressed",
  },
  { value: "UNRESOLVED", label: "Not resolved", hint: "Nothing actually changed" },
];

const STEP_COPY: Record<string, { action: string; blurb: string }> = {
  VERIFIED: {
    action: "Verify report",
    blurb:
      "Confirm this report is genuine and well formed. It stays in triage until you publish it.",
  },
  PUBLISHED: {
    action: "Publish report",
    blurb:
      "Publish this report to the public directory so the company and community can respond.",
  },
};

export function IssueWorkflowActions({
  issue,
  onUpdated,
}: {
  issue: Issue;
  onUpdated: (issue: Issue) => void;
}) {
  const viewer = issue.viewer;
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState<ResolutionOutcome>("RESOLVED");
  const [satisfaction, setSatisfaction] = useState(4);
  const [busy, setBusy] = useState(false);

  if (!viewer) return null;

  const nextStep = viewer.moderatorNextStatus;
  const showModeration = !!nextStep;
  const showPropose = !!viewer.canProposeResolution;
  const showConfirm = !!viewer.canConfirmResolution;

  if (!showModeration && !showPropose && !showConfirm) return null;

  async function moderate(status: "VERIFIED" | "PUBLISHED" | "RESOLUTION_PENDING") {
    setBusy(true);
    try {
      const updated = await api<Issue>(`/issues/${issue.publicId}/status`, {
        method: "PATCH",
        body: { status, note: note.trim() || undefined },
      });
      onUpdated(updated);
      setNote("");
      toast.success(
        status === "RESOLUTION_PENDING"
          ? "Reporter asked to confirm the resolution"
          : `Issue marked ${humanize(status).toLowerCase()}`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the issue");
    } finally {
      setBusy(false);
    }
  }

  async function confirmResolution(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await api<Issue>(`/issues/${issue.publicId}/resolution`, {
        method: "POST",
        body: { outcome, satisfaction, note: note.trim() || undefined },
      });
      onUpdated(updated);
      setNote("");
      toast.success("Thanks — your resolution is on the record");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not record the resolution",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel panel-pad space-y-4 border-accent/35">
      <div>
        <h2 className="section-title">
          {showConfirm ? "Confirm the outcome" : "Workflow actions"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {showConfirm
            ? viewer.confirmingForAbsentReporter
              ? "This report was filed anonymously, so there is no reporter account to confirm it. Close it out on their behalf."
              : `${issue.company.name} says this is resolved. Only you can confirm that.`
            : showModeration
              ? STEP_COPY[nextStep!]?.blurb
              : "Tell the reporter you believe this is resolved. They confirm the outcome, not you."}
        </p>
      </div>

      {showConfirm ? (
        <form onSubmit={confirmResolution} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="eyebrow">What actually happened</legend>
            {OUTCOMES.map((o) => (
              <label
                key={o.value}
                className={`flex cursor-pointer items-start gap-2.5 rounded-[--radius-sm] border px-3 py-2.5 transition-colors ${
                  outcome === o.value
                    ? "border-accent bg-accent-soft"
                    : "border-border hover:bg-surface-2"
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  value={o.value}
                  checked={outcome === o.value}
                  onChange={() => setOutcome(o.value)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold">{o.label}</span>
                  <span className="block text-xs text-muted">{o.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <div>
            <label htmlFor="satisfaction" className="eyebrow">
              How satisfied are you with how it was handled?
            </label>
            <div className="mt-2 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} out of 5`}
                  aria-pressed={satisfaction === n}
                  onClick={() => setSatisfaction(n)}
                  className={`h-9 w-9 rounded-[--radius-sm] border text-sm font-semibold transition-colors ${
                    satisfaction === n
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-surface text-muted hover:bg-surface-2"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-xs text-subtle">1 = poorly, 5 = very well</span>
            </div>
          </div>

          <textarea
            className="textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional: add a closing note for others reading this issue."
          />

          <button type="submit" className="btn btn-accent" disabled={busy}>
            {busy ? "Recording…" : "Record the outcome"}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <textarea
            className="textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              showModeration
                ? "Optional: add a moderator note to the thread explaining your decision."
                : "Optional: tell the reporter what changed."
            }
          />
          <div className="flex flex-wrap gap-2">
            {showModeration && (
              <button
                type="button"
                className="btn btn-accent"
                disabled={busy}
                onClick={() => void moderate(nextStep!)}
              >
                {busy ? "Working…" : STEP_COPY[nextStep!]?.action}
              </button>
            )}
            {showPropose && (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => void moderate("RESOLUTION_PENDING")}
              >
                {busy ? "Working…" : "Ask the reporter to confirm resolution"}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
