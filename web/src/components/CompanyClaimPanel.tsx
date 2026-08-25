"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Props = {
  slug: string;
  name: string;
  claimStatus?: string;
  /** Open the form immediately, e.g. when arriving from a "claim this profile" link. */
  defaultOpen?: boolean;
};

/**
 * Claim entry point on a company profile. Requesting a claim only marks the
 * profile PENDING; a moderator has to approve it before the verified badge and
 * official replies unlock.
 */
export function CompanyClaimPanel({
  slug,
  name,
  claimStatus,
  defaultOpen = false,
}: Props) {
  const { user, refresh } = useAuth();
  const [open, setOpen] = useState(defaultOpen);
  const [title, setTitle] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);

  const membership = user?.companies?.find((c) => c.slug === slug);

  if (membership?.approved) {
    return (
      <div className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm text-muted">
          You manage this profile
          {membership.title ? ` as ${membership.title}` : ""}. Replies you post
          on issues appear as official {name} responses.
        </p>
        <Link
          href={`/issues?company=${slug}`}
          className="btn btn-secondary min-h-10"
        >
          Open issue inbox
        </Link>
      </div>
    );
  }

  if (requested || membership) {
    return (
      <div className="panel px-4 py-3">
        <p className="text-sm text-muted">
          Your claim request for {name} is in review. Once a moderator verifies
          it, the profile shows a{" "}
          <span className="font-semibold text-good">Verified profile</span> badge
          and you can respond to issues officially.
        </p>
      </div>
    );
  }

  if (claimStatus === "CLAIMED") return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api(`/companies/${slug}/claim`, {
        method: "POST",
        body: {
          title: title.trim() || undefined,
          workEmail: workEmail.trim() || undefined,
        },
      });
      setRequested(true);
      await refresh();
      toast.success("Claim request sent for review");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-accent hover:underline"
      >
        Work at {name}? Claim this profile →
      </button>
    );
  }

  if (!user) {
    return (
      <div className="panel px-4 py-3">
        <p className="text-sm text-muted">
          Claiming a profile needs an account so we can verify who you are.{" "}
          <Link
            href={`/login?next=/companies/${slug}`}
            className="font-semibold text-accent hover:underline"
          >
            Sign in
          </Link>{" "}
          or{" "}
          <Link
            href="/register"
            className="font-semibold text-accent hover:underline"
          >
            create one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel panel-pad space-y-3">
      <div>
        <h3 className="section-title">Claim {name}</h3>
        <p className="mt-1 text-sm text-muted">
          Tell us your role and a work email on the company domain. A moderator
          verifies the claim before the profile is marked as verified.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="claim-title">
            Your role
          </label>
          <input
            id="claim-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contributor Support Lead"
          />
        </div>
        <div>
          <label className="label" htmlFor="claim-email">
            Work email
          </label>
          <input
            id="claim-email"
            type="email"
            className="input"
            value={workEmail}
            onChange={(e) => setWorkEmail(e.target.value)}
            placeholder={`you@${slug.replace(/-/g, "")}.com`}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <button
          type="submit"
          className="btn btn-accent min-h-10"
          disabled={submitting}
        >
          {submitting ? "Sending…" : "Request verification"}
        </button>
        <button
          type="button"
          className="btn btn-ghost min-h-10"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
