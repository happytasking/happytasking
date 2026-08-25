import type { Request } from "express";

const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|uptime|wget|curl|python-requests|httpclient/i;

export type RequestMeta = {
  ip: string;
  userAgent: string | null;
};

export function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return normalizeIp(forwarded.split(",")[0].trim());
  }
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real.trim()) {
    return normalizeIp(real.trim());
  }
  return normalizeIp(req.ip || req.socket.remoteAddress || "unknown");
}

export function requestMeta(req: Request): RequestMeta {
  const ua = req.headers["user-agent"];
  return {
    ip: clientIp(req),
    userAgent: typeof ua === "string" ? ua.slice(0, 240) : null,
  };
}

export function isBotUserAgent(ua?: string | null) {
  if (!ua) return false;
  return BOT_UA.test(ua);
}

export function isPublicIp(ip: string) {
  const v4 = ip.replace(/^::ffff:/i, "");
  if (!v4 || v4 === "unknown" || v4 === "localhost") return false;
  if (v4 === "127.0.0.1" || v4 === "::1") return false;
  if (v4.startsWith("10.")) return false;
  if (v4.startsWith("192.168.")) return false;
  if (v4.startsWith("169.254.")) return false;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(v4)) return false;
  if (v4.startsWith("fc") || v4.startsWith("fd") || v4.startsWith("fe80")) return false;
  return true;
}

function normalizeIp(ip: string) {
  return ip.replace(/^::ffff:/i, "");
}
