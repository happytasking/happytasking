"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api, qs } from "@/lib/api";
import type { Company, CreateReviewInput, Domain, Pagination } from "@/lib/types";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/lib/auth";

const TOTAL_STEPS = 6;

const SCORE_GROUPS: {
  title: string;
  description: string;
  fields: { key: keyof CreateReviewInput; label: string }[];
}[] = [
  {
    title: "Core experience",
    description: "Overall quality and pay reliability",
    fields: [
      { key: "overallExperience", label: "Overall experience" },
      { key: "paySatisfaction", label: "Pay satisfaction" },
      { key: "paymentReliability", label: "Payment reliability" },
    ],
  },
  {
    title: "Work conditions",
    description: "Availability, stability, and fairness",
    fields: [
      { key: "taskAvailability", label: "Task availability" },
      { key: "projectStability", label: "Project stability" },
      { key: "reviewerFairness", label: "Reviewer fairness" },
    ],
  },
  {
    title: "Platform quality",
    description: "Guidelines, support, and transparency",
    fields: [
      { key: "guidelineClarity", label: "Guideline clarity" },
      { key: "supportQuality", label: "Support quality" },
      { key: "transparency", label: "Transparency" },
    ],
  },
];

function RatingControl({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <fieldset>
      <legend className="label" id={`${id}-label`}>
        {label}
      </legend>
      <div
        className="mt-1 grid grid-cols-5 gap-1.5"
        role="radiogroup"
        aria-labelledby={`${id}-label`}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`flex min-h-12 items-center justify-center rounded-[--radius-sm] border text-base font-semibold transition-colors ${
                selected
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border-strong bg-surface text-muted hover:border-border-strong hover:bg-[rgba(12,14,18,0.045)]"
              }`}
              onClick={() => onChange(n)}
            >
              <span className="num">{n}</span>
            </button>
          );
        })}
      </div>
      <p className="hint">1 = poor · 5 = excellent</p>
    </fieldset>
  );
}

function NewReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateReviewInput>({
    companySlug: searchParams.get("company") || "",
    domainId: "",
    overallExperience: 4,
    paySatisfaction: 4,
    paymentReliability: 4,
    taskAvailability: 4,
    projectStability: 4,
    reviewerFairness: 4,
    guidelineClarity: 4,
    supportQuality: 4,
    transparency: 4,
    wouldWorkAgain: true,
    title: "",
    body: "",
    identityMode: "ANONYMOUS",
    displayName: "",
    currentlyActive: true,
    country: "",
  });

  useEffect(() => {
    void Promise.all([
      api<{ items: Company[]; pagination: Pagination }>(
        `/companies${qs({ sort: "name", limit: 50 })}`,
      ),
      api<Domain[]>("/companies/meta/domains"),
    ]).then(([c, d]) => {
      setCompanies(c.items);
      setDomains(d);
      const domainSlug = searchParams.get("domain");
      const domain = d.find((item) => item.slug === domainSlug);
      if (domain) {
        setForm((prev) => ({ ...prev, domainId: domain.id }));
      }
      const companySlug = searchParams.get("company");
      if (companySlug && domain) setStep(3);
      else if (companySlug) setStep(2);
      if (searchParams.get("from") === "onboarding") {
        void api("/profile/events", {
          method: "POST",
          body: { name: "review_started_after_onboarding" },
        }).catch(() => undefined);
      }
    });
  }, [searchParams]);

  const selectedDomain = useMemo(
    () => domains.find((d) => d.id === form.domainId),
    [domains, form.domainId],
  );

  const selectedCompany = useMemo(
    () => companies.find((c) => c.slug === form.companySlug),
    [companies, form.companySlug],
  );

  function setField<K extends keyof CreateReviewInput>(
    key: K,
    value: CreateReviewInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(current: number) {
    if (current === 1 && !form.companySlug) {
      toast.error("Select a company");
      return false;
    }
    if (current === 6) {
      if (form.title.trim().length < 5) {
        toast.error("Title must be at least 5 characters");
        return false;
      }
      if (form.body.trim().length < 20) {
        toast.error("Experience text must be at least 20 characters");
        return false;
      }
    }
    return true;
  }

  const stepValid = useMemo(() => {
    if (step === 1) return !!form.companySlug;
    if (step === 6)
      return form.title.trim().length >= 5 && form.body.trim().length >= 20;
    return true;
  }, [step, form.companySlug, form.title, form.body]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep(6)) return;
    setSubmitting(true);
    try {
      const payload: CreateReviewInput = {
        ...form,
        domainId: form.domainId || undefined,
        displayName:
          form.identityMode === "ANONYMOUS"
            ? form.displayName || "Anonymous contributor"
            : user?.displayName || user?.username || form.displayName,
        country: form.country || undefined,
      };
      await api("/reviews", { method: "POST", body: payload });
      toast.success("Experience shared");
      router.push(`/companies/${form.companySlug}?tab=reviews`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);
  const scoreGroup =
    step >= 3 && step <= 5 ? SCORE_GROUPS[step - 3] : null;

  return (
    <div className="container-page max-w-2xl space-y-6">
      <div>
        <p className="eyebrow">Contribute</p>
        <h1 className="page-title mt-1">Share an experience</h1>
        <p className="mt-2 text-sm text-muted">
          Structured feedback only. Share your experience, not confidential work.
        </p>
      </div>

      <div className="panel panel-pad space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">
            Step <span className="num">{step}</span> of{" "}
            <span className="num">{TOTAL_STEPS}</span>
          </p>
          <p className="num text-xs text-subtle">{progressPct}%</p>
        </div>
        <div className="meter" aria-hidden="true">
          <span
            style={{ width: `${progressPct}%`, background: "var(--accent)" }}
          />
        </div>
        <ol className="flex flex-wrap gap-1.5" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <li
              key={n}
              className={`h-1.5 flex-1 rounded-full ${
                n <= step ? "bg-accent" : "bg-[var(--border)]"
              }`}
            />
          ))}
        </ol>
      </div>

      <form onSubmit={onSubmit} className="panel panel-pad space-y-5">
        {step === 1 && (
          <>
            <div>
              <h2 className="section-title">Which company?</h2>
              <p className="mt-1 text-sm text-muted">
                Select the AI-work platform this experience is about.
              </p>
            </div>
            <div>
              <label className="label" htmlFor="company">
                Company
              </label>
              <select
                id="company"
                className="select"
                value={form.companySlug}
                onChange={(e) => setField("companySlug", e.target.value)}
                required
              >
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              {selectedCompany && (
                <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3 py-2.5">
                  <CompanyLogo
                    name={selectedCompany.name}
                    logoUrl={selectedCompany.logoUrl}
                    size="md"
                    fit="auto"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{selectedCompany.name}</p>
                    <p className="truncate text-xs text-subtle">
                      {selectedCompany.headquarters ||
                        selectedCompany.country ||
                        "Reviewing this platform"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="section-title">Context</h2>
              <p className="mt-1 text-sm text-muted">
                Optional details that help others interpret your ratings.
              </p>
            </div>
            <div>
              <label className="label" htmlFor="domain">
                Domain
              </label>
              <select
                id="domain"
                className="select"
                value={form.domainId || ""}
                onChange={(e) => setField("domainId", e.target.value)}
              >
                <option value="">Optional</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {selectedDomain?.skills && selectedDomain.skills.length > 0 && (
                <p className="hint">
                  Related skills:{" "}
                  {selectedDomain.skills.map((s) => s.name).join(", ")}
                </p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="country">
                Country (optional)
              </label>
              <input
                id="country"
                className="input"
                value={form.country || ""}
                onChange={(e) => setField("country", e.target.value)}
              />
            </div>
            <label className="flex min-h-11 items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--accent)]"
                checked={!!form.currentlyActive}
                onChange={(e) => setField("currentlyActive", e.target.checked)}
              />
              Currently active with this company
            </label>
          </>
        )}

        {scoreGroup && (
          <>
            <div>
              <h2 className="section-title">{scoreGroup.title}</h2>
              <p className="mt-1 text-sm text-muted">{scoreGroup.description}</p>
            </div>
            <div className="space-y-5">
              {scoreGroup.fields.map((field) => (
                <RatingControl
                  key={field.key}
                  id={String(field.key)}
                  label={field.label}
                  value={Number(form[field.key])}
                  onChange={(n) => setField(field.key, n as never)}
                />
              ))}
            </div>
            {step === 5 && (
              <fieldset>
                <legend className="label">
                  Would you work with them again?
                </legend>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`btn min-h-12 ${
                      form.wouldWorkAgain ? "btn-accent" : "btn-secondary"
                    }`}
                    onClick={() => setField("wouldWorkAgain", true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`btn min-h-12 ${
                      !form.wouldWorkAgain ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => setField("wouldWorkAgain", false)}
                  >
                    No
                  </button>
                </div>
              </fieldset>
            )}
          </>
        )}

        {step === 6 && (
          <>
            <div>
              <h2 className="section-title">Write & publish</h2>
              <p className="mt-1 text-sm text-muted">
                Summarize your experience without confidential project details.
              </p>
            </div>
            <div>
              <label className="label" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                className="input"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Reliable pay, uneven task flow"
                required
                minLength={5}
              />
            </div>
            <div>
              <label className="label" htmlFor="body">
                Your experience
              </label>
              <textarea
                id="body"
                className="textarea"
                value={form.body}
                onChange={(e) => setField("body", e.target.value)}
                placeholder="Describe pay, availability, reviewers, and support — without confidential project details."
                required
                minLength={20}
              />
              <p className="hint">
                At least 20 characters. Avoid prompts, client names, and private
                data.
              </p>
            </div>
            <fieldset>
              <legend className="label">Identity</legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className={`btn min-h-11 ${
                    form.identityMode === "ANONYMOUS"
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  onClick={() => setField("identityMode", "ANONYMOUS")}
                >
                  Anonymous
                </button>
                <button
                  type="button"
                  className={`btn min-h-11 ${
                    form.identityMode === "USERNAME"
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  onClick={() => setField("identityMode", "USERNAME")}
                  disabled={!user}
                >
                  {user ? "Use my username" : "Username (sign in)"}
                </button>
              </div>
            </fieldset>
            {form.identityMode === "ANONYMOUS" && (
              <div>
                <label className="label" htmlFor="displayName">
                  Display label (optional)
                </label>
                <input
                  id="displayName"
                  className="input"
                  value={form.displayName || ""}
                  onChange={(e) => setField("displayName", e.target.value)}
                  placeholder="Anonymous contributor"
                />
              </div>
            )}
            <div className="rounded-[--radius-sm] border border-border bg-surface-2 px-4 py-3">
              <p className="eyebrow">Privacy reminder</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Share your experience, not confidential work. Never post project
                codenames, prompts, task content, client names, or private data.
                Anonymous by default; verification stays private.{" "}
                <Link
                  href="/privacy-for-contributors"
                  className="font-semibold text-accent hover:underline"
                >
                  Privacy for contributors
                </Link>
              </p>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex gap-2">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-secondary min-h-11"
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                className="btn btn-primary min-h-11"
                disabled={!stepValid}
                onClick={() => {
                  if (validateStep(step)) setStep((s) => s + 1);
                }}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-accent min-h-11"
                disabled={submitting || !stepValid}
              >
                {submitting ? "Submitting…" : "Publish experience"}
              </button>
            )}
          </div>
          <Link
            href="/companies"
            className="btn btn-ghost min-h-11"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page max-w-2xl space-y-4" role="status" aria-label="Loading">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-48 w-full" />
        </div>
      }
    >
      <NewReviewContent />
    </Suspense>
  );
}
