"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api, qs } from "@/lib/api";
import type { Company, CreateIssueInput, Issue, Pagination } from "@/lib/types";
import { Skeleton } from "@/components/Skeleton";
import { ISSUE_CATEGORIES, humanize } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { ConfidentialityNote } from "@/components/ConfidentialityNote";

function NewIssueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Issue | null>(null);
  const [form, setForm] = useState<CreateIssueInput>({
    companySlug: searchParams.get("company") || "",
    category: "PAYMENT",
    title: "",
    body: "",
    desiredOutcome: "",
    publicIdentityMode: "ANONYMOUS",
  });

  useEffect(() => {
    void api<{ items: Company[]; pagination: Pagination }>(
      `/companies${qs({ sort: "name", limit: 50 })}`,
    ).then((res) => setCompanies(res.items));
  }, []);

  const canSubmit = useMemo(
    () =>
      !!form.companySlug &&
      form.title.trim().length >= 5 &&
      form.body.trim().length >= 20,
    [form.companySlug, form.title, form.body],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const created = await api<Issue>("/issues", {
        method: "POST",
        body: {
          ...form,
          desiredOutcome: form.desiredOutcome || undefined,
        },
      });
      toast.success("Issue submitted");
      // A new report sits in triage and is not public. Signed-in reporters can open
      // their own report; anonymous guests have nothing to authenticate with, so
      // sending them to the detail page would only produce a "not found".
      if (user) {
        router.push(`/issues/${created.publicId}`);
      } else {
        setSubmitted(created);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="container-page max-w-2xl space-y-6">
        <div>
          <p className="eyebrow">Resolution</p>
          <h1 className="page-title mt-1">Report received</h1>
        </div>
        <div className="panel panel-pad space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-good-bg text-good">Submitted</span>
            <span className="num text-sm font-semibold">
              {submitted.publicId}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Keep this reference. A moderator verifies reports before they appear
            in the public directory, and a verified{" "}
            {submitted.company?.name ?? "company"} representative can respond
            once it is published.
          </p>
          <p className="rounded-[--radius-sm] bg-surface-2 px-3 py-2 text-sm text-muted">
            You reported anonymously, so this page is the only confirmation you
            get.{" "}
            <Link
              href="/register"
              className="font-semibold text-accent hover:underline"
            >
              Create an account
            </Link>{" "}
            before reporting next time to track status and reply to the company.
          </p>
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Link href="/issues" className="btn btn-secondary min-h-11">
              Browse issues
            </Link>
            <Link
              href={`/companies/${submitted.company?.slug ?? ""}`}
              className="btn btn-ghost min-h-11"
            >
              Back to company
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl space-y-6">
      <div>
        <p className="eyebrow">Resolution</p>
        <h1 className="page-title mt-1">Report an issue</h1>
        <p className="mt-2 text-sm text-muted">
          Use this for payment problems, reviewer disputes, and support failures.
        </p>
        <ConfidentialityNote className="mt-4" />
      </div>

      <form onSubmit={onSubmit} className="panel panel-pad space-y-4">
        {!user && (
          <p className="rounded-[--radius-sm] bg-surface-2 px-3 py-2 text-sm text-muted">
            You can report anonymously, but you won&apos;t be able to track it or
            reply to the company.{" "}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Log in
            </Link>{" "}
            to attach the report to your account privately.
          </p>
        )}
        <div>
          <label className="label" htmlFor="company">
            Company
          </label>
          <select
            id="company"
            className="select"
            value={form.companySlug}
            onChange={(e) =>
              setForm((f) => ({ ...f, companySlug: e.target.value }))
            }
            required
          >
            <option value="">Select company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            className="select"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {ISSUE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {humanize(c)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className="input"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            minLength={5}
            placeholder="Unpaid onboarding after assessment"
          />
        </div>
        <div>
          <label className="label" htmlFor="body">
            Details
          </label>
          <textarea
            id="body"
            className="textarea"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            required
            minLength={20}
            placeholder="Describe what happened without sharing confidential project content."
          />
          <p className="hint">At least 20 characters.</p>
        </div>
        <div>
          <label className="label" htmlFor="outcome">
            Desired outcome (optional)
          </label>
          <input
            id="outcome"
            className="input"
            value={form.desiredOutcome || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, desiredOutcome: e.target.value }))
            }
            placeholder="Payment for completed assessment hours"
          />
        </div>
        <fieldset>
          <legend className="label">Public identity</legend>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className={`btn min-h-11 ${
                form.publicIdentityMode === "ANONYMOUS"
                  ? "btn-primary"
                  : "btn-secondary"
              }`}
              onClick={() =>
                setForm((f) => ({ ...f, publicIdentityMode: "ANONYMOUS" }))
              }
            >
              Anonymous
            </button>
            <button
              type="button"
              className={`btn min-h-11 ${
                form.publicIdentityMode === "USERNAME"
                  ? "btn-primary"
                  : "btn-secondary"
              }`}
              onClick={() =>
                setForm((f) => ({ ...f, publicIdentityMode: "USERNAME" }))
              }
              disabled={!user}
            >
              {user ? "Username" : "Username (sign in)"}
            </button>
          </div>
        </fieldset>

        <div className="rounded-[--radius-sm] border border-border bg-surface-2 px-4 py-3">
          <p className="eyebrow">Privacy reminder</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Do not include prompts, task content, project codenames, or client
            identifiers. Focus on process, pay, and support outcomes.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <button
            type="submit"
            className="btn btn-accent min-h-11"
            disabled={submitting || !canSubmit}
          >
            {submitting ? "Submitting…" : "Submit issue"}
          </button>
          <Link href="/issues" className="btn btn-ghost min-h-11">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewIssuePage() {
  return (
    <Suspense
      fallback={
        <div className="container-page max-w-2xl space-y-4" role="status" aria-label="Loading">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <NewIssueContent />
    </Suspense>
  );
}
