"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CompanyLogo } from "@/components/CompanyLogo";
import { ErrorNote } from "@/components/ErrorNote";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { QuickPulse } from "@/components/QuickPulse";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Skeleton } from "@/components/Skeleton";
import type {
  Domain,
  OnboardingCompany,
  OnboardingExperienceDraft,
  OnboardingState,
  Skill,
} from "@/lib/types";

function visualStep(step: string) {
  if (step === "welcome" || step === "country") return 1;
  if (step === "domains" || step === "skills") return 2;
  if (step === "companies") return 3;
  return 4;
}

type LocalExperience = OnboardingExperienceDraft & {
  company: OnboardingCompany;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading, refresh } = useAuth();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [step, setStep] = useState("welcome");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState("");
  const [domainIds, setDomainIds] = useState<string[]>([]);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [customNames, setCustomNames] = useState<string[]>([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [experiences, setExperiences] = useState<LocalExperience[]>([]);
  const [companyQuery, setCompanyQuery] = useState("");
  const [companyHits, setCompanyHits] = useState<OnboardingCompany[]>([]);
  const [reviewPromptTracked, setReviewPromptTracked] = useState(false);

  const load = useCallback(async () => {
    const data = await api<OnboardingState>("/onboarding/start", {
      method: "POST",
    });
    let nextStep = data.currentStep || "welcome";
    if (data.completed) {
      if (!data.draft.countryCode) nextStep = "country";
      else if (!data.draft.domainIds.length) nextStep = "domains";
      else if (!data.draft.skillIds.length) nextStep = "skills";
      else if (!data.draft.experiences.length) nextStep = "companies";
      else nextStep = "done";
    }
    setState(data);
    setStep(nextStep);
    setCountryCode(data.draft.countryCode || "");
    setDomainIds(data.draft.domainIds);
    setSkillIds(data.draft.skillIds);
    setExperiences(
      data.draft.experiences.map((e) => ({
        ...e,
        company: e.company,
      })),
    );
  }, [router]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/register");
      return;
    }
    void load().catch((err) => {
      setError(err instanceof Error ? err.message : "Could not load onboarding");
    });
  }, [authLoading, user, router, load]);

  useEffect(() => {
    if (!companyQuery.trim()) {
      void api<OnboardingCompany[]>(`/onboarding/companies`).then(setCompanyHits);
      return;
    }
    const t = setTimeout(() => {
      void api<OnboardingCompany[]>(
        `/onboarding/companies?q=${encodeURIComponent(companyQuery)}`,
      ).then(setCompanyHits);
    }, 180);
    return () => clearTimeout(t);
  }, [companyQuery]);

  const catalog = state?.catalog;
  const selectedDomains = useMemo(
    () => catalog?.domains.filter((d) => domainIds.includes(d.id)) ?? [],
    [catalog, domainIds],
  );

  const visibleSkills = useMemo(() => {
    if (!catalog) return [];
    const pool = catalog.allSkills.length ? catalog.allSkills : catalog.skills;
    const selected = new Set(domainIds);
    let list = pool.filter(
      (s) => !s.domainId || selected.size === 0 || selected.has(s.domainId),
    );
    const q = skillQuery.trim().toLowerCase();
    if (q) list = pool.filter((s) => s.name.toLowerCase().includes(q));
    return list.slice(0, 12);
  }, [catalog, domainIds, skillQuery]);

  async function run<T>(fn: () => Promise<T>) {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function saveCountry() {
    const next = await run(() =>
      api<OnboardingState>("/onboarding/country", {
        method: "POST",
        body: { countryCode },
      }),
    );
    apply(next);
  }

  async function saveDomains(skipped = false) {
    const next = await run(() =>
      api<OnboardingState>("/onboarding/domains", {
        method: "POST",
        body: { domainIds, skipped },
      }),
    );
    apply(next);
  }

  async function saveSkills(skipped = false) {
    const next = await run(() =>
      api<OnboardingState>("/onboarding/skills", {
        method: "POST",
        body: { skillIds, customNames, skipped },
      }),
    );
    apply(next);
  }

  async function saveExperiences(skipped = false) {
    const next = await run(() =>
      api<OnboardingState>("/onboarding/experiences", {
        method: "POST",
        body: {
          skipped,
          experiences: skipped
            ? []
            : experiences
                .filter((e) => e.tenureBucket)
                .map((e) => ({
                  companyId: e.companyId,
                  currentlyActive: e.currentlyActive,
                  tenureBucket: e.tenureBucket,
                  primaryDomainId: e.primaryDomainId || undefined,
                })),
        },
      }),
    );
    apply(next);
    await complete();
  }

  async function complete(skipped = false) {
    const next = await run(() =>
      api<OnboardingState>("/onboarding/complete", {
        method: "POST",
        body: { skipped },
      }),
    );
    apply(next);
    await refresh();
  }

  function apply(next: OnboardingState) {
    setState(next);
    setStep(next.currentStep);
  }

  function toggle(list: string[], id: string) {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  function addCompany(company: OnboardingCompany) {
    if (experiences.some((e) => e.companyId === company.id)) return;
    setExperiences((prev) => [
      ...prev,
      {
        companyId: company.id,
        company,
        currentlyActive: true,
        tenureBucket: "ONE_TO_THREE_MONTHS",
        primaryDomainId: domainIds[0] || null,
        availabilityStatus: null,
      },
    ]);
    setCompanyQuery("");
  }

  const primaryCurrent = experiences.find((e) => e.currentlyActive);
  const primaryDomain =
    selectedDomains.find((d) => d.id === primaryCurrent?.primaryDomainId) ||
    selectedDomains[0];

  useEffect(() => {
    if (step !== "done" || reviewPromptTracked || !primaryCurrent) return;
    setReviewPromptTracked(true);
    void api("/profile/events", {
      method: "POST",
      body: { name: "review_prompt_shown" },
    }).catch(() => undefined);
  }, [step, reviewPromptTracked, primaryCurrent]);

  if (authLoading || !state || !catalog) {
    return (
      <div className="container-page max-w-lg space-y-4" role="status">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const reviewHref = primaryCurrent
    ? `/reviews/new?company=${primaryCurrent.company.slug}${
        primaryDomain ? `&domain=${primaryDomain.slug}` : ""
      }&from=onboarding`
    : "/reviews/new?from=onboarding";

  return (
    <div className="container-page max-w-lg space-y-5 pb-8">
      {step !== "welcome" && (
        <OnboardingProgress current={visualStep(step)} />
      )}
      {error && <ErrorNote message={error} />}

      {step === "welcome" && (
        <section className="panel panel-pad space-y-5">
          <p className="eyebrow">Welcome to Happy Tasking</p>
          <h1 className="page-title">Tell us about your AI work.</h1>
          <p className="text-sm leading-relaxed text-muted">
            Help us personalize your experience and make AI work more
            transparent.
          </p>
          <p className="text-sm font-medium">Takes about 1 minute.</p>
          <div className="rounded-[var(--radius-sm)] border border-border bg-surface-2 px-4 py-3 text-sm leading-relaxed text-muted">
            <p className="font-semibold text-foreground">Your work. Your privacy.</p>
            <p className="mt-1">
              Share your experience, not confidential work. We never ask for
              project codenames, task prompts, answers, internal guidelines,
              client names, or reviewer identities.{" "}
              <Link
                href="/privacy-for-contributors"
                className="font-semibold text-accent hover:underline"
              >
                Read the contributor privacy page
              </Link>
            </p>
          </div>
          <button
            type="button"
            className="btn btn-accent min-h-12 w-full"
            onClick={() => setStep("country")}
          >
            Get started
          </button>
          <button
            type="button"
            className="btn btn-ghost min-h-11 w-full"
            disabled={busy}
            onClick={() => void complete(true).then(() => router.push("/"))}
          >
            Skip for now
          </button>
        </section>
      )}

      {step === "country" && (
        <section className="panel panel-pad space-y-5">
          <div>
            <h1 className="page-title">Where are you based?</h1>
            <p className="mt-2 text-sm text-muted">
              Used to understand AI-work opportunities and rates by market.
            </p>
          </div>
          <SearchableSelect
            id="country"
            label="Country"
            placeholder="Search countries"
            value={countryCode}
            onChange={setCountryCode}
            items={catalog.countries.map((c) => ({
              id: c.code,
              label: `${c.flag} ${c.name}`,
            }))}
          />
          <div className="sticky-actions flex gap-2">
            <button
              type="button"
              className="btn btn-accent min-h-12 flex-1"
              disabled={!countryCode || busy}
              onClick={() => void saveCountry()}
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === "domains" && (
        <section className="panel panel-pad space-y-5">
          <div>
            <h1 className="page-title">What kind of AI work do you do?</h1>
            <p className="mt-2 text-sm text-muted">Select all that apply.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {catalog.domains.map((d: Domain) => (
              <button
                key={d.id}
                type="button"
                className="choice-card min-h-14"
                data-selected={domainIds.includes(d.id)}
                onClick={() => setDomainIds((ids) => toggle(ids, d.id))}
              >
                {d.name}
              </button>
            ))}
          </div>
          <div className="sticky-actions flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-accent min-h-12 flex-1"
              disabled={busy}
              onClick={() => void saveDomains(false)}
            >
              Continue
            </button>
            <button
              type="button"
              className="btn btn-ghost min-h-12"
              disabled={busy}
              onClick={() => void saveDomains(true)}
            >
              Skip for now
            </button>
          </div>
        </section>
      )}

      {step === "skills" && (
        <section className="panel panel-pad space-y-5">
          <div>
            <h1 className="page-title">What are your main skills?</h1>
            <p className="mt-2 text-sm text-muted">
              Choose the skills you actually use or evaluate. About 3–10 is
              plenty.
            </p>
          </div>
          <input
            className="input min-h-12"
            placeholder="Search skills"
            value={skillQuery}
            onChange={(e) => setSkillQuery(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {visibleSkills.map((s: Skill) => {
              const selected = skillIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`chip min-h-10 px-3 ${selected ? "chip-accent" : ""}`}
                  onClick={() => setSkillIds((ids) => toggle(ids, s.id))}
                >
                  {selected ? "✓ " : ""}
                  {s.name}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              className="input min-h-12 flex-1"
              placeholder="Add another skill"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const name = customSkill.trim();
                  if (name && !customNames.includes(name)) {
                    setCustomNames((n) => [...n, name]);
                    setCustomSkill("");
                  }
                }
              }}
            />
            <button
              type="button"
              className="btn btn-secondary min-h-12"
              onClick={() => {
                const name = customSkill.trim();
                if (name && !customNames.includes(name)) {
                  setCustomNames((n) => [...n, name]);
                  setCustomSkill("");
                }
              }}
            >
              + Add
            </button>
          </div>
          {customNames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customNames.map((name) => (
                <span key={name} className="chip chip-accent">
                  {name}
                </span>
              ))}
            </div>
          )}
          <div className="sticky-actions flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-accent min-h-12 flex-1"
              disabled={busy}
              onClick={() => void saveSkills(false)}
            >
              Continue
            </button>
            <button
              type="button"
              className="btn btn-ghost min-h-12"
              disabled={busy}
              onClick={() => void saveSkills(true)}
            >
              Skip for now
            </button>
          </div>
        </section>
      )}

      {step === "companies" && (
        <section className="panel panel-pad space-y-5">
          <div>
            <h1 className="page-title">
              Which AI-work platforms have you worked with?
            </h1>
            <p className="mt-2 text-sm text-muted">
              Current or previous experience is useful.
            </p>
          </div>
          <SearchableSelect
            id="company"
            label="Search platforms"
            placeholder="Search companies"
            value=""
            onQuery={setCompanyQuery}
            onChange={(id) => {
              const company = companyHits.find((c) => c.id === id);
              if (company) addCompany(company);
            }}
            items={companyHits
              .filter((c) => !experiences.some((e) => e.companyId === c.id))
              .map((c) => ({ id: c.id, label: c.name }))}
          />

          <div className="space-y-4">
            {experiences.map((exp) => {
              const domain = catalog.domains.find(
                (d) => d.id === exp.primaryDomainId,
              );
              return (
                <article
                  key={exp.companyId}
                  className="rounded-[var(--radius)] border border-border bg-surface-2 p-4 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <CompanyLogo
                      name={exp.company.name}
                      logoUrl={exp.company.logoUrl}
                      size="md"
                      fit="auto"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{exp.company.name}</p>
                      <button
                        type="button"
                        className="text-xs text-muted hover:underline"
                        onClick={() =>
                          setExperiences((prev) =>
                            prev.filter((e) => e.companyId !== exp.companyId),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <fieldset>
                    <legend className="label">
                      Are you currently working with this company?
                    </legend>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="choice-card"
                        data-selected={exp.currentlyActive}
                        onClick={() =>
                          setExperiences((prev) =>
                            prev.map((e) =>
                              e.companyId === exp.companyId
                                ? { ...e, currentlyActive: true }
                                : e,
                            ),
                          )
                        }
                      >
                        Yes, currently
                      </button>
                      <button
                        type="button"
                        className="choice-card"
                        data-selected={!exp.currentlyActive}
                        onClick={() =>
                          setExperiences((prev) =>
                            prev.map((e) =>
                              e.companyId === exp.companyId
                                ? { ...e, currentlyActive: false }
                                : e,
                            ),
                          )
                        }
                      >
                        Previously
                      </button>
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend className="label">How long have you worked there?</legend>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      {catalog.tenureBuckets.map((bucket) => (
                        <button
                          key={bucket.value}
                          type="button"
                          className="choice-card min-h-11 text-xs"
                          data-selected={exp.tenureBucket === bucket.value}
                          onClick={() =>
                            setExperiences((prev) =>
                              prev.map((e) =>
                                e.companyId === exp.companyId
                                  ? { ...e, tenureBucket: bucket.value }
                                  : e,
                              ),
                            )
                          }
                        >
                          {bucket.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  {selectedDomains.length > 0 && (
                    <fieldset>
                      <legend className="label">Primary work area</legend>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedDomains.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            className={`chip min-h-10 ${
                              exp.primaryDomainId === d.id ? "chip-accent" : ""
                            }`}
                            onClick={() =>
                              setExperiences((prev) =>
                                prev.map((e) =>
                                  e.companyId === exp.companyId
                                    ? { ...e, primaryDomainId: d.id }
                                    : e,
                                ),
                              )
                            }
                          >
                            {d.name}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}
                  {exp.currentlyActive && (
                    <QuickPulse
                      companySlug={exp.company.slug}
                      companyName={exp.company.name}
                      domainId={exp.primaryDomainId || undefined}
                      domainName={domain?.name}
                      source="onboarding"
                      compact
                    />
                  )}
                </article>
              );
            })}
          </div>

          <div className="sticky-actions flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-accent min-h-12 flex-1"
              disabled={busy || (experiences.length > 0 && experiences.some((e) => !e.tenureBucket))}
              onClick={() => void saveExperiences(experiences.length === 0)}
            >
              Continue
            </button>
            <button
              type="button"
              className="btn btn-ghost min-h-12"
              disabled={busy}
              onClick={() => void saveExperiences(true)}
            >
              Skip for now
            </button>
          </div>
        </section>
      )}

      {step === "done" && (
        <section className="panel panel-pad space-y-6">
          <div>
            <h1 className="page-title">You&apos;re in! 🎉</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Your first matches are ready. TaskMatch uses the profile you just
              built to estimate where your AI skills fit best.
            </p>
          </div>

          <div className="rounded-[var(--radius)] border border-border bg-surface-2 px-4 py-4 text-sm">
            <p className="eyebrow">Your experience becomes intelligence</p>
            <ol className="mt-3 space-y-1.5 text-muted">
              <li>Your experience</li>
              <li className="pl-2 text-subtle">↓ Private account data + public pseudonymity when you choose it</li>
              <li>Anonymous structured signal</li>
              <li className="pl-2 text-subtle">↓ Combined with other contributors</li>
              <li>TaskScore · TaskPulse · TaskRate</li>
              <li className="pl-2 text-subtle">↓ Better information for AI workers</li>
            </ol>
            <p className="mt-3 text-muted">
              Your individual answers are used to create aggregated community
              insights. Email stays private. Company experience defaults to
              aggregate-only.
            </p>
          </div>

          {primaryCurrent && (
            <div className="rounded-[var(--radius)] border border-border px-4 py-4">
              <h2 className="section-title">
                Help other {primaryDomain?.name?.split(" / ")[0].toLowerCase() || "AI"} contributors
              </h2>
              <p className="mt-1 text-sm text-muted">
                How has your experience with {primaryCurrent.company.name} been?
              </p>
              <Link
                href={reviewHref}
                className="btn btn-accent mt-3 min-h-12 w-full"
                onClick={() => {
                  void api("/profile/events", {
                    method: "POST",
                    body: { name: "review_started_after_onboarding" },
                  }).catch(() => undefined);
                }}
              >
                Share your {primaryCurrent.company.name} experience
              </Link>
            </div>
          )}

          <div className="space-y-2">
            <Link href="/taskmatch" className="btn btn-accent min-h-12 w-full">
              See my TaskMatches
            </Link>
            <Link href={reviewHref} className="btn btn-secondary min-h-12 w-full">
              Share your experience
            </Link>
            <p className="hint text-center">Reviews take about 1 minute.</p>
            <Link href="/" className="btn btn-ghost min-h-12 w-full">
              Explore Happy Tasking
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
