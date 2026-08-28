import { env } from "../config/env.js";
import { assertAllowedHost } from "./urls.js";

export class HttpStatusError extends Error {
  constructor(
    public status: number,
    public retryAfterMs: number | null,
    message: string,
  ) {
    super(message);
  }
}

function retryAfterMs(res: Response): number | null {
  const raw = res.headers.get("retry-after");
  if (!raw) return null;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(raw);
  if (Number.isNaN(date)) return null;
  return Math.max(0, date - Date.now());
}

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAllowed(
  url: string,
  opts: {
    allowedHosts: string[];
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    timeoutMs?: number;
    etag?: string | null;
    lastModified?: string | null;
  },
): Promise<{
  status: number;
  body: string;
  etag: string | null;
  lastModified: string | null;
  notModified: boolean;
}> {
  const parsed = assertAllowedHost(url, opts.allowedHosts);
  const timeoutMs = opts.timeoutMs ?? env.OPPORTUNITY_SYNC_REQUEST_TIMEOUT_MS;
  const headers: Record<string, string> = {
    "user-agent": env.OPPORTUNITY_SYNC_USER_AGENT,
    accept: "text/html,application/json,text/x-component,*/*",
    ...(opts.headers || {}),
  };
  if (opts.etag) headers["if-none-match"] = opts.etag;
  if (opts.lastModified) headers["if-modified-since"] = opts.lastModified;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(parsed.toString(), {
      method: opts.method || "GET",
      headers,
      body: opts.body,
      redirect: "follow",
      signal: controller.signal,
    });
    if (res.status === 429) {
      throw new HttpStatusError(
        429,
        retryAfterMs(res) ?? 15_000,
        "Rate limited by source",
      );
    }
    if (res.status === 304) {
      return {
        status: 304,
        body: "",
        etag: res.headers.get("etag"),
        lastModified: res.headers.get("last-modified"),
        notModified: true,
      };
    }
    if (!res.ok) {
      throw new HttpStatusError(res.status, retryAfterMs(res), `HTTP ${res.status}`);
    }
    const body = await res.text();
    return {
      status: res.status,
      body,
      etag: res.headers.get("etag"),
      lastModified: res.headers.get("last-modified"),
      notModified: false,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function withBackoff<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number } = {},
): Promise<T> {
  const attempts = opts.attempts ?? 4;
  let last: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      last = error;
      if (error instanceof HttpStatusError && error.status === 429) {
        await sleep(Math.min(error.retryAfterMs ?? 15_000 * (i + 1), 60_000));
        continue;
      }
      if (i === attempts - 1) break;
      await sleep(Math.min(1000 * 2 ** i, 8_000));
    }
  }
  throw last;
}
