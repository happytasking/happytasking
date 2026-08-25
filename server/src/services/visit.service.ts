import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { isBotUserAgent, type RequestMeta } from "../lib/requestMeta.js";
import { lookupGeo } from "./geo.service.js";
import { trackEvent } from "./analytics.service.js";

export const pageviewSchema = z.object({
  path: z
    .string()
    .min(1)
    .max(300)
    .refine((p) => p.startsWith("/") && !p.startsWith("//"), "Invalid path"),
  referrer: z.string().max(500).optional().nullable(),
  sessionId: z.string().min(8).max(80),
});

function sanitizeReferrer(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return value.slice(0, 200);
  }
}

export async function recordPageview(
  input: z.infer<typeof pageviewSchema>,
  meta: RequestMeta,
  userId?: string,
) {
  if (isBotUserAgent(meta.userAgent)) {
    return { recorded: false, reason: "bot" as const };
  }

  const since = new Date(Date.now() - 30_000);
  const duplicate = await prisma.visit.findFirst({
    where: {
      sessionId: input.sessionId,
      path: input.path,
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  if (duplicate) {
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt: new Date() },
      });
    }
    return { recorded: false, reason: "duplicate" as const };
  }

  const geo = await lookupGeo(meta.ip);
  await prisma.visit.create({
    data: {
      sessionId: input.sessionId,
      userId: userId || null,
      path: input.path.slice(0, 300),
      referrer: sanitizeReferrer(input.referrer),
      ip: meta.ip,
      country: geo.country,
      countryCode: geo.countryCode,
      region: geo.region,
      city: geo.city,
      userAgent: meta.userAgent,
    },
  });

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  }

  return { recorded: true as const };
}

export async function recordAuthEvent(
  name: "login_succeeded" | "signup_completed",
  userId: string,
  meta: RequestMeta,
) {
  const geo = await lookupGeo(meta.ip);
  if (name === "login_succeeded") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        lastSeenAt: new Date(),
        lastLoginIp: meta.ip,
        lastLoginCountry: geo.country,
      },
    });
  }
  await trackEvent(name, {
    userId,
    properties: {
      ip: meta.ip,
      country: geo.country,
      countryCode: geo.countryCode,
      city: geo.city,
    },
  });
}
