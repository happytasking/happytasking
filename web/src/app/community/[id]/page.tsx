"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Comment, Discussion } from "@/lib/types";
import { CompanyLogo } from "@/components/CompanyLogo";
import { DemoBadge } from "@/components/DemoBadge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorNote } from "@/components/ErrorNote";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton, SkeletonCards } from "@/components/Skeleton";
import { authorName, UserAvatar } from "@/components/UserAvatar";
import { formatDate, humanize } from "@/lib/format";
import { useAuth } from "@/lib/auth";

function CommentBlock({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const author = authorName(comment.author);
  return (
    <div
      className={
        depth > 0
          ? "ml-3 border-l-2 border-border pl-4 sm:ml-5"
          : ""
      }
    >
      <div
        className={`flex gap-3 ${depth === 0 ? "panel panel-pad" : "py-3"}`}
      >
        <UserAvatar name={author} size={depth === 0 ? "sm" : "xs"} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-subtle">
            <span className="font-semibold text-muted">{author}</span>
            {" · "}
            {formatDate(comment.createdAt)}
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
            {comment.body}
          </p>
        </div>
      </div>
      {(comment.replies || []).length > 0 && (
        <div className="mt-1 space-y-1">
          {comment.replies!.map((r) => (
            <CommentBlock key={r.id} comment={r} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiscussionDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Discussion>(`/community/${params.id}`);
      setDiscussion(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setDiscussion(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onComment(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await api<Comment>(`/community/${params.id}/comments`, {
        method: "POST",
        body: { body },
      });
      setBody("");
      toast.success("Comment added");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to comment");
    } finally {
      setSubmitting(false);
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
        <Skeleton className="h-40 w-full" />
        <SkeletonCards count={3} className="h-24" />
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="container-page max-w-3xl space-y-4">
        {error && <ErrorNote message={error} onRetry={() => void load()} />}
        <EmptyState
          title="Discussion not found"
          description={error || undefined}
          action={
            <Link href="/community" className="btn btn-secondary">
              Back to community
            </Link>
          }
        />
      </div>
    );
  }

  const commentCount =
    discussion._count?.comments ?? discussion.comments?.length ?? 0;
  const poster = authorName(discussion.author);

  return (
    <div className="container-page max-w-3xl space-y-6">
      <div>
        <Link
          href="/community"
          className="text-sm font-medium text-muted hover:text-accent"
        >
          ← Community
        </Link>
        <p className="eyebrow mt-4">Discussion</p>
        <div className="mt-1 flex flex-wrap items-start gap-2">
          <h1 className="page-title">{discussion.title}</h1>
          <DemoBadge show={!!discussion.isDemo} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <UserAvatar name={poster} size="sm" />
            <span className="font-semibold text-foreground">{poster}</span>
          </span>
          <span className="chip">{humanize(discussion.category)}</span>
          {discussion.company && (
            <Link
              href={`/companies/${discussion.company.slug}`}
              className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
            >
              <CompanyLogo
                name={discussion.company.name}
                logoUrl={discussion.company.logoUrl}
                size="xs"
                fit="mark"
              />
              {discussion.company.name}
            </Link>
          )}
          <span className="text-subtle">· {formatDate(discussion.createdAt)}</span>
          {discussion.voteScore != null && (
            <span className="num font-semibold">
              {discussion.voteScore} votes
            </span>
          )}
        </div>
      </div>

      <article className="panel panel-pad">
        <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed">
          {discussion.body}
        </p>
      </article>

      <section className="space-y-4">
        <SectionHeader title={`Comments (${commentCount})`} />

        <form onSubmit={onComment} className="panel panel-pad space-y-3">
          <label className="label" htmlFor="comment">
            Add a comment
          </label>
          {!user && (
            <p className="text-xs text-muted">
              Commenting as a guest.{" "}
              <Link href="/login" className="font-semibold text-accent hover:underline">
                Log in
              </Link>{" "}
              to attach your profile.
            </p>
          )}
          <textarea
            id="comment"
            className="textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Keep it professional and non-confidential."
            required
          />
          <button
            type="submit"
            className="btn btn-primary min-h-11"
            disabled={submitting || !body.trim()}
          >
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </form>

        {(discussion.comments || []).length === 0 ? (
          <EmptyState
            title="No comments yet"
            description="Start the conversation."
          />
        ) : (
          <div className="space-y-3">
            {discussion.comments!.map((c) => (
              <CommentBlock key={c.id} comment={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
