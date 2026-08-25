"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorNote } from "@/components/ErrorNote";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/lib/auth";
import { afterAuthPath } from "@/lib/format";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, loading } = useAuth();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    displayName: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace(afterAuthPath(user));
    }
  }, [loading, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        displayName: form.displayName || undefined,
      });
      toast.success("Account created");
      router.push("/onboarding");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    form.email.length > 0 &&
    form.username.length >= 3 &&
    form.password.length >= 8;

  if (loading) {
    return (
      <div
        className="container-page flex justify-center"
        role="status"
        aria-label="Loading"
      >
        <div className="w-full max-w-[26rem] space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex justify-center">
      <div className="w-full max-w-[26rem] space-y-6">
        <div className="text-center sm:text-left">
          <p className="eyebrow">Account</p>
          <h1 className="page-title mt-1">Join Happy Tasking</h1>
          <p className="mt-2 text-sm text-muted">
            The community for AI work. Know before you task.
          </p>
        </div>

        <form onSubmit={onSubmit} className="panel panel-pad space-y-4">
          {error && <ErrorNote message={error} />}
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="input"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              required
              minLength={3}
              pattern="[a-zA-Z0-9_]+"
              autoComplete="username"
            />
            <p className="hint">Letters, numbers, and underscores only.</p>
          </div>
          <div>
            <label className="label" htmlFor="displayName">
              Display name (optional)
            </label>
            <input
              id="displayName"
              className="input"
              value={form.displayName}
              onChange={(e) =>
                setForm((f) => ({ ...f, displayName: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="hint">At least 8 characters.</p>
          </div>
          <p className="rounded-[--radius-sm] bg-surface-2 px-3 py-2 text-xs text-muted">
            Share your experience, not confidential work.{" "}
            <Link
              href="/privacy-for-contributors"
              className="font-semibold text-accent hover:underline"
            >
              Privacy for contributors
            </Link>
          </p>
          <button
            type="submit"
            className="btn btn-accent min-h-11 w-full"
            disabled={submitting || !canSubmit}
          >
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-accent hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
