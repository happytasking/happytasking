import type { ApiEnvelope } from "./types";

const API_ORIGIN = process.env.API_PROXY_ORIGIN || "http://127.0.0.1:5000";

export class ServerApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ServerApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Server-only fetch to the local API. Does not go through Cloudflare or robots.txt.
 * Failures throw — callers must not treat them as an empty result set.
 */
export async function serverApi<T>(
  path: string,
  init?: { revalidate?: number | false },
): Promise<T> {
  const res = await fetch(`${API_ORIGIN}/api/v1${path}`, {
    headers: { Accept: "application/json" },
    next:
      init?.revalidate === false
        ? { revalidate: 0 }
        : { revalidate: init?.revalidate ?? 120 },
  });

  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ServerApiError(
      `Company data upstream returned HTTP ${res.status}`,
      res.status,
    );
  }

  if (!res.ok || !json.success || json.data == null) {
    throw new ServerApiError(
      json?.message || `Company data upstream returned HTTP ${res.status}`,
      json?.statusCode || res.status,
    );
  }

  return json.data;
}
