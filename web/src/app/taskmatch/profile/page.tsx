"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { TaskMatchProfile } from "@/lib/types";
import { ErrorNote } from "@/components/ErrorNote";
import { Skeleton } from "@/components/Skeleton";
import { ProfileStrength } from "@/components/taskmatch/ProfileStrength";

export default function TaskMatchProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<TaskMatchProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    void api<TaskMatchProfile>("/taskmatch/profile")
      .then(setProfile)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load profile"));
  }, [user]);

  async function save(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const next = await api<TaskMatchProfile>("/taskmatch/profile", {
        method: "PATCH",
        body,
      });
      setProfile(next);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="container-page max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        {error && <ErrorNote message={error} />}
      </div>
    );
  }

  const pref = profile.preference;

  return (
    <div className="container-page max-w-2xl space-y-6">
      <Link href="/taskmatch" className="text-sm font-semibold text-accent">
        ← TaskMatch
      </Link>
      <div>
        <p className="eyebrow">TaskMatch profile</p>
        <h1 className="page-title mt-1">Improve your matches</h1>
        <p className="mt-2 text-sm text-muted">
          Availability, rate, and links stay private. Better profile → better
          matches.
        </p>
      </div>

      <ProfileStrength percent={profile.strength.percent} items={profile.strength.items} />

      <form
        className="panel panel-pad space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const languages = String(form.get("languages") || "")
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
            .map((code) => ({ code, proficiency: "PROFESSIONAL" as const }));
          void save({
            lookingStatus: form.get("lookingStatus") || null,
            workload: form.get("workload") || null,
            startTiming: form.get("startTiming") || null,
            professionalExperienceYears: form.get("years")
              ? Number(form.get("years"))
              : null,
            aiWorkExperienceYears: form.get("aiYears")
              ? Number(form.get("aiYears"))
              : null,
            desiredRate: form.get("desiredRate")
              ? Number(form.get("desiredRate"))
              : null,
            desiredRateCurrency: form.get("currency") || "USD",
            desiredRateUnit: form.get("desiredRateUnit") || null,
            githubUrl: form.get("githubUrl") || "",
            linkedinUrl: form.get("linkedinUrl") || "",
            portfolioUrl: form.get("portfolioUrl") || "",
            summary: form.get("summary") || null,
            languages,
            skillProficiency: profile.skills
              .map((s) => ({
                skillId: s.skillId,
                proficiency: String(form.get(`skill-${s.skillId}`) || "") || null,
              }))
              .filter((s) => s.proficiency),
          });
        }}
      >
        <label className="block space-y-1">
          <span className="label">What are you looking for?</span>
          <select name="lookingStatus" className="select" defaultValue={pref?.lookingStatus || ""}>
            <option value="">Not set</option>
            <option value="READY">Ready for new AI work</option>
            <option value="OPEN_TO_OFFERS">Open to good opportunities</option>
            <option value="NOT_LOOKING">Not looking right now</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="label">Preferred weekly workload</span>
          <select name="workload" className="select" defaultValue={pref?.workload || ""}>
            <option value="">Not set</option>
            <option value="UNDER_10">&lt;10 hours</option>
            <option value="TEN_TO_TWENTY">10–20</option>
            <option value="TWENTY_TO_THIRTY">20–30</option>
            <option value="THIRTY_TO_FORTY">30–40</option>
            <option value="FORTY_PLUS">40+</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="label">How soon could you start?</span>
          <select name="startTiming" className="select" defaultValue={pref?.startTiming || ""}>
            <option value="">Not set</option>
            <option value="IMMEDIATELY">Immediately</option>
            <option value="WITHIN_1_WEEK">Within 1 week</option>
            <option value="WITHIN_2_WEEKS">Within 2 weeks</option>
            <option value="WITHIN_1_MONTH">Within 1 month</option>
            <option value="EXPLORING">Just exploring</option>
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="label">Professional experience (years)</span>
            <input
              name="years"
              type="number"
              min={0}
              max={60}
              className="input"
              defaultValue={pref?.professionalExperienceYears ?? ""}
            />
          </label>
          <label className="space-y-1">
            <span className="label">AI-work experience (years)</span>
            <input
              name="aiYears"
              type="number"
              min={0}
              max={40}
              className="input"
              defaultValue={pref?.aiWorkExperienceYears ?? ""}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 sm:col-span-1">
            <span className="label">Desired rate</span>
            <input
              name="desiredRate"
              type="number"
              min={1}
              className="input"
              defaultValue={pref?.desiredRate ?? ""}
            />
          </label>
          <label className="space-y-1">
            <span className="label">Currency</span>
            <input
              name="currency"
              className="input"
              defaultValue={pref?.desiredRateCurrency || "USD"}
            />
          </label>
          <label className="space-y-1">
            <span className="label">Unit</span>
            <select name="desiredRateUnit" className="select" defaultValue={pref?.desiredRateUnit || "HOURLY"}>
              <option value="HOURLY">Hourly</option>
              <option value="PER_TASK">Per task</option>
              <option value="MILESTONE">Milestone</option>
            </select>
          </label>
        </div>
        <label className="block space-y-1">
          <span className="label">Languages (comma-separated codes)</span>
          <input
            name="languages"
            className="input"
            defaultValue={profile.languages.map((l) => l.code).join(", ")}
            placeholder="en, pt, es"
          />
        </label>
        {profile.skills.length > 0 && (
          <div className="space-y-2">
            <p className="label">Primary skill proficiency</p>
            {profile.skills.map((s) => (
              <label key={s.skillId} className="flex items-center justify-between gap-3 text-sm">
                <span>{s.name}</span>
                <select
                  name={`skill-${s.skillId}`}
                  className="select max-w-40"
                  defaultValue={s.proficiency || ""}
                >
                  <option value="">Not set</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </label>
            ))}
          </div>
        )}
        <label className="block space-y-1">
          <span className="label">GitHub URL</span>
          <input name="githubUrl" className="input" defaultValue={pref?.githubUrl || ""} />
        </label>
        <label className="block space-y-1">
          <span className="label">LinkedIn URL</span>
          <input name="linkedinUrl" className="input" defaultValue={pref?.linkedinUrl || ""} />
        </label>
        <label className="block space-y-1">
          <span className="label">Portfolio URL</span>
          <input name="portfolioUrl" className="input" defaultValue={pref?.portfolioUrl || ""} />
        </label>
        <label className="block space-y-1">
          <span className="label">Professional summary</span>
          <textarea
            name="summary"
            className="input min-h-24"
            defaultValue={pref?.summary || ""}
          />
        </label>
        <button type="submit" className="btn btn-accent min-h-11" disabled={busy}>
          {busy ? "Saving…" : "Save details"}
        </button>
      </form>
    </div>
  );
}
