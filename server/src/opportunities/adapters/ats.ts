import { fetchAllowed } from "../http.js";
import { classifyPrimarySource } from "../provenance.js";
import type { PrimarySourceGuess } from "../types.js";

export const ATS_ALLOWED_HOSTS = [
  "boards-api.greenhouse.io",
  "job-boards.greenhouse.io",
  "boards.greenhouse.io",
  "jobs.ashbyhq.com",
  "api.ashbyhq.com",
  "jobs.lever.co",
  "api.lever.co",
  "apply.workable.com",
];

export function greenhouseJobApiUrl(guess: PrimarySourceGuess): string | null {
  if (guess.kind !== "greenhouse" || !guess.board || !guess.jobId) return null;
  return `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(guess.board)}/jobs/${encodeURIComponent(guess.jobId)}`;
}

export function ashbyBoardUrl(guess: PrimarySourceGuess): string | null {
  if (guess.kind !== "ashby" || !guess.board) return null;
  return `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(guess.board)}`;
}

export function leverPostingsUrl(guess: PrimarySourceGuess): string | null {
  if (guess.kind !== "lever" || !guess.board) return null;
  return `https://api.lever.co/v0/postings/${encodeURIComponent(guess.board)}?mode=json`;
}

export async function verifyPrimaryListing(
  applyUrl: string | null | undefined,
): Promise<{ verified: boolean; guess: PrimarySourceGuess; reason: string }> {
  const guess = classifyPrimarySource(applyUrl);
  if (!guess.official || !guess.canonicalUrl) {
    return { verified: false, guess, reason: "No first-party listing URL" };
  }

  try {
    if (guess.kind === "greenhouse") {
      const api = greenhouseJobApiUrl(guess);
      if (!api) return { verified: false, guess, reason: "Incomplete Greenhouse URL" };
      await fetchAllowed(api, { allowedHosts: ATS_ALLOWED_HOSTS });
      return { verified: true, guess, reason: "Greenhouse public job API" };
    }
    if (guess.kind === "ashby") {
      const api = ashbyBoardUrl(guess);
      if (!api) return { verified: false, guess, reason: "Incomplete Ashby URL" };
      const res = await fetchAllowed(api, { allowedHosts: ATS_ALLOWED_HOSTS });
      const found =
        guess.jobId != null && res.body.toLowerCase().includes(String(guess.jobId).toLowerCase());
      return {
        verified: found,
        guess,
        reason: found ? "Ashby public board contains job id" : "Ashby job id not on board",
      };
    }
    if (guess.kind === "lever") {
      const api = leverPostingsUrl(guess);
      if (!api) return { verified: false, guess, reason: "Incomplete Lever URL" };
      const res = await fetchAllowed(api, { allowedHosts: ATS_ALLOWED_HOSTS });
      const found =
        guess.jobId != null && res.body.toLowerCase().includes(String(guess.jobId).toLowerCase());
      return {
        verified: found,
        guess,
        reason: found ? "Lever public postings contain job id" : "Lever job id not found",
      };
    }
    return {
      verified: false,
      guess,
      reason: "First-party URL classified from public apply link; not independently fetched",
    };
  } catch (error) {
    return {
      verified: false,
      guess,
      reason: error instanceof Error ? error.message : "Primary source fetch failed",
    };
  }
}
