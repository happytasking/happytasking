"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorNote } from "@/components/ErrorNote";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/lib/auth";
import { afterAuthPath } from "@/lib/format";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const signedIn = await login(email, password);
      toast.success("Welcome back");
      router.push(afterAuthPath(signedIn));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div
        className="container-page flex justify-center"
        role="status"
        aria-label="Loading"
      >
        <div className="w-full max-w-[26rem] space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex justify-center">
      <div className="w-full max-w-[26rem] space-y-6">
        <div className="text-center sm:text-left">
          <p className="eyebrow">Account</p>
          <h1 className="page-title mt-1">Log in</h1>
          <p className="mt-2 text-sm text-muted">
            Access your Happy Tasking profile and contribution history.
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary min-h-11 w-full"
            disabled={submitting || !email || !password}
          >
            {submitting ? "Signing in…" : "Log in"}
          </button>
          <p className="hint text-center">
            Demo: demo@happytasking.com / password123
          </p>
        </form>

        <p className="text-center text-sm text-muted">
          No account?{" "}
          <Link
            href="/register"
            className="font-semibold text-accent hover:underline"
          >
            Join Happy Tasking
          </Link>
        </p>
      </div>
    </div>
  );
}
