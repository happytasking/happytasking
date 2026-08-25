"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Issue, IssueReply } from "@/lib/types";
import { ClaimBadge } from "@/components/ClaimBadge";
import { CompanyLogo } from "@/components/CompanyLogo";
import { IssueWorkflowActions } from "@/components/IssueWorkflowActions";
import { DemoBadge } from "@/components/DemoBadge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton } from "@/components/Skeleton";
import { authorName, UserAvatar } from "@/components/UserAvatar";
import { formatDateTime, formatRelativeTime, humanize } from "@/lib/format";

const WORKFLOW = [
  "SUBMITTED",
  "VERIFIED",
  "PUBLISHED",
  "COMPANY_RESPONDED",
  "RESOLVED",
] as const;

function workflowIndex(status: string): number {
  if (status === "PARTIALLY_RESOLVED" || status === "UNRESOLVED") {
    return WORKFLOW.indexOf("RESOLVED");
  }
  if (status === "RESOLUTION_PENDING") {
    return WORKFLOW.indexOf("COMPANY_RESPONDED");
  }
  const idx = WORKFLOW.indexOf(status as (typeof WORKFLOW)[number]);
  return idx >= 0 ? idx : 0;
}

function workflowLabel(step: string) {
  if (step === "COMPANY_RESPONDED") return "Company Responded";
  return humanize(step);
}

export default function IssueDetailPage() {
  const params = useParams<{ publicId: string }>();
  const { user } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [newReplyId, setNewReplyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Issue>(`/issues/${params.publicId}`);
      setIssue(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load issue");
      setIssue(null);
    } finally {
      setLoading(false);
    }
  }, [params.publicId]);

  // Reload once auth resolves: the reporter and company reps see more than guests.
  useEffect(() => {
    void load();
  }, [load, user?.id]);

  const activeStep = useMemo(
    () => (issue ? workflowIndex(issue.status) : 0),
    [issue],
  );

  useEffect(() => {
    if (!newReplyId) return;
    document
      .getElementById(`reply-${newReplyId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => setNewReplyId(null), 2500);
    return () => clearTimeout(timer);
  }, [newReplyId]);

  async function onReply(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (body.length < 5) return;
    setPosting(true);
    try {
      const updated = await api<Issue>(`/issues/${params.publicId}/replies`, {
        method: "POST",
        body: { body },
      });
      setIssue(updated);
      setDraft("");
      // The thread is chronological, so a new reply lands at the bottom — point the
      // reader at it rather than letting it appear off screen.
      setNewReplyId(updated.replies?.at(-1)?.id ?? null);
      toast.success("Reply posted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <div
        className="container-page max-w-3xl space-y-4"
        role="status"
        aria-label="Loading"
      >
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !issue) {
    // A 404 here usually means the report is still in triage rather than broken,
    // so it gets an explanation instead of an error banner.
    const missing = !error || /not found/i.test(error);
    return (
      <div className="container-page max-w-3xl space-y-4">
        {!missing && <ErrorNote message={error} onRetry={() => void load()} />}
        <EmptyState
          title={missing ? "This issue isn't public" : "Issue not found"}
          description={
            missing
              ? "Reports stay private while moderators verify them — only the reporter and a verified company representative can open them. If you filed it, sign in with that account."
              : undefined
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/issues" className="btn btn-secondary">
                Back to issues
              </Link>
              {missing && !user && (
                <Link href="/login" className="btn btn-ghost">
                  Sign in
                </Link>
              )}
            </div>
          }
        />
      </div>
    );
  }

  const anonymous = issue.identityProtected ?? !issue.author;
  const reporter = anonymous ? null : authorName(issue.author) || issue.identity;
  const replies = issue.replies ?? [];
  const viewer = issue.viewer;
  const claimed = issue.company.claimStatus === "CLAIMED";

  return (
    <div className="container-page max-w-3xl space-y-6">
      <div>
        <Link
          href="/issues"
          className="text-sm font-medium text-muted hover:text-accent"
        >
          ← Issues
        </Link>
        <p className="eyebrow mt-4">Issue report</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="num text-sm font-semibold text-subtle">
            {issue.publicId}
          </span>
          <DemoBadge show={issue.isDemo} />
          <span className="badge bg-accent-soft text-accent">
            {humanize(issue.status)}
          </span>
        </div>
        <h1 className="page-title mt-2">{issue.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <UserAvatar name={reporter} anonymous={anonymous} size="sm" />
            <span className="font-semibold text-foreground">
              {anonymous ? "Identity protected" : reporter}
            </span>
          </span>
          <span>· {humanize(issue.category)}</span>
          <Link
            href={`/companies/${issue.company.slug}`}
            className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
          >
            <CompanyLogo
              name={issue.company.name}
              logoUrl={issue.company.logoUrl}
              size="xs"
              fit="mark"
            />
            {issue.company.name}
          </Link>
          <ClaimBadge status={issue.company.claimStatus} />
          <span className="text-subtle">
            · Submitted{" "}
            <time
              dateTime={issue.submittedAt}
              title={formatDateTime(issue.submittedAt)}
            >
              {formatDateTime(issue.submittedAt)}
            </time>
          </span>
        </div>
      </div>

      {issue.isPublic === false && (
        <div className="rounded-[--radius-sm] border border-mid/30 bg-mid-bg px-4 py-3">
          <p className="text-sm font-semibold text-mid">
            In triage — not public yet
          </p>
          <p className="mt-1 text-sm text-muted">
            Moderators verify reports before they appear in the public directory.
            For now only you and a verified {issue.company.name} representative
            can open this page.
          </p>
        </div>
      )}

      <section className="panel panel-pad">
        <SectionHeader
          title="Workflow"
          description="From submission through resolution"
        />
        <ol className="mt-2 grid gap-2 sm:grid-cols-5">
          {WORKFLOW.map((step, i) => {
            const done = i < activeStep;
            const current = i === activeStep;
            return (
              <li
                key={step}
                className={`rounded-[--radius-sm] border px-2.5 py-3 text-center ${
                  current
                    ? "border-accent bg-accent-soft"
                    : done
                      ? "border-border bg-surface-2"
                      : "border-border bg-surface"
                }`}
              >
                <span
                  className={`num mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[0.6875rem] font-bold ${
                    current
                      ? "bg-accent text-white"
                      : done
                        ? "bg-good text-white"
                        : "bg-demo-bg text-demo"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <p
                  className={`mt-2 text-[0.6875rem] font-semibold leading-snug ${
                    current ? "text-accent" : "text-muted"
                  }`}
                >
                  {workflowLabel(step)}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <IssueWorkflowActions issue={issue} onUpdated={setIssue} />

      <article className="panel panel-pad space-y-4">
        <div>
          <h2 className="section-title">Report</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {issue.body}
          </p>
        </div>
        {issue.desiredOutcome && (
          <div className="border-t border-border pt-4">
            <h2 className="section-title">Desired outcome</h2>
            <p className="mt-2 text-sm text-muted">{issue.desiredOutcome}</p>
          </div>
        )}
        <div className="grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
          <div>
            <p className="eyebrow">Verification</p>
            <p className="mt-1.5 font-medium">
              {humanize(issue.verificationStatus)}
            </p>
          </div>
          <div>
            <p className="eyebrow">Resolution</p>
            <p className="mt-1.5 font-medium">
              {issue.resolutionStatus
                ? humanize(issue.resolutionStatus)
                : "Pending"}
            </p>
            {issue.resolvedAt && (
              <p className="mt-1 text-xs text-subtle">
                Closed {formatDateTime(issue.resolvedAt)}
                {issue.resolutionSatisfaction != null &&
                  ` · reporter rated the handling ${issue.resolutionSatisfaction}/5`}
              </p>
            )}
          </div>
        </div>
      </article>

      <section className="space-y-3">
        <SectionHeader
          title="Conversation"
          description={
            replies.length === 0
              ? "Replies from the company and the reporter appear here"
              : `${replies.length} ${replies.length === 1 ? "reply" : "replies"}`
          }
          right={
            issue.companyReplied ? (
              <span className="badge bg-good-bg text-good">
                Company responded
              </span>
            ) : undefined
          }
        />

        {replies.length === 0 ? (
          <div className="panel panel-pad">
            <p className="text-sm text-muted">
              {claimed
                ? `No reply from ${issue.company.name} yet.`
                : `${issue.company.name} has not claimed its profile, so no verified representative can respond here yet.`}
            </p>
            {!claimed && (
              <Link
                href={`/companies/${issue.company.slug}?claim=1`}
                className="mt-3 inline-flex text-sm font-semibold text-accent hover:underline"
              >
                Work at {issue.company.name}? Claim the profile →
              </Link>
            )}
          </div>
        ) : (
          <ol className="space-y-3">
            {replies.map((r) => (
              <li key={r.id} id={`reply-${r.id}`}>
                <ReplyCard
                  reply={r}
                  companyName={issue.company.name}
                  highlight={r.id === newReplyId}
                />
              </li>
            ))}
          </ol>
        )}

        {viewer?.canReply ? (
          <form onSubmit={onReply} className="panel panel-pad space-y-3">
            <div className="flex items-center gap-2">
              {viewer.isCompany ? (
                <>
                  <CompanyLogo
                    name={issue.company.name}
                    logoUrl={issue.company.logoUrl}
                    size="sm"
                    fit="mark"
                  />
                  <p className="text-sm font-semibold">
                    Replying officially as {issue.company.name}
                  </p>
                </>
              ) : (
                <>
                  <UserAvatar
                    name={anonymous ? null : reporter}
                    anonymous={anonymous}
                    size="sm"
                  />
                  <p className="text-sm font-semibold">
                    {viewer.isModerator
                      ? "Replying as a moderator"
                      : anonymous
                        ? "Replying as the reporter (identity protected)"
                        : "Replying as the reporter"}
                  </p>
                </>
              )}
            </div>
            <textarea
              className="textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                viewer.isCompany
                  ? "Explain what happened, what you're changing, and by when. This reply is public."
                  : "Add context or confirm whether the issue was resolved."
              }
              minLength={5}
              required
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="hint">
                {viewer.isCompany
                  ? "Posted as a verified company response and shown publicly."
                  : "Do not include confidential project content."}
              </p>
              <button
                type="submit"
                className="btn btn-accent min-h-11"
                disabled={posting || draft.trim().length < 5}
              >
                {posting ? "Posting…" : "Post reply"}
              </button>
            </div>
          </form>
        ) : (
          <div className="panel panel-pad">
            <p className="text-sm text-muted">
              {!user ? (
                <>
                  Only the reporter and verified company representatives can
                  reply.{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-accent hover:underline"
                  >
                    Sign in
                  </Link>{" "}
                  if that is you.
                </>
              ) : (
                "Only the reporter and verified company representatives can reply to this issue."
              )}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ReplyCard({
  reply,
  companyName,
  highlight = false,
}: {
  reply: IssueReply;
  companyName: string;
  highlight?: boolean;
}) {
  const official = reply.isOfficial;

  return (
    <article
      className={[
        "panel panel-pad transition-shadow",
        official ? "border-accent/35 bg-accent-soft/40" : "",
        highlight ? "ring-2 ring-accent/60" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start gap-3">
        {official ? (
          <CompanyLogo
            name={companyName}
            logoUrl={reply.authorLogoUrl}
            size="md"
            fit="mark"
          />
        ) : (
          <UserAvatar
            name={reply.identityProtected ? null : reply.authorLabel}
            anonymous={reply.identityProtected}
            size="md"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold">{reply.authorLabel}</span>
            {official && (
              <span className="badge bg-good-bg text-good">
                Official response
              </span>
            )}
            {reply.role === "MODERATOR" && (
              <span className="badge bg-accent-soft text-accent">
                Moderator
              </span>
            )}
            {!official && reply.isReporter && (
              <span className="badge bg-demo-bg text-demo">Reporter</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-subtle">
            {reply.authorTitle && <span>{reply.authorTitle} · </span>}
            <time dateTime={reply.createdAt} title={formatDateTime(reply.createdAt)}>
              {formatDateTime(reply.createdAt)}
            </time>
            <span className="text-subtle"> · {formatRelativeTime(reply.createdAt)}</span>
          </p>
          <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed">
            {reply.body}
          </p>
        </div>
      </div>
    </article>
  );
}
