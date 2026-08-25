import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const insightsQuerySchema = z.object({
  days: z.coerce.number().min(1).max(90).optional(),
  q: z.string().max(80).optional(),
  includeDemo: z.enum(["true", "false"]).optional(),
});

const DEMO_EMAIL = {
  OR: [
    { email: { endsWith: "@demo.local" } },
    { email: { in: ["demo@happytasking.com", "moderator@happytasking.com"] } },
    { email: { endsWith: ".demo" } },
  ],
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function dayLabel(iso: string) {
  const [, m, day] = iso.split("-");
  return `${Number(m)}/${Number(day)}`;
}

function fillDays(from: Date, to: Date, counts: Map<string, number>) {
  const points = [];
  const cursor = startOfDay(from);
  const end = startOfDay(to);
  while (cursor <= end) {
    const key = dayKey(cursor);
    points.push({ label: dayLabel(key), value: counts.get(key) ?? 0, key });
    cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}

function countByDay<T extends { createdAt: Date }>(rows: T[]) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = dayKey(row.createdAt);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export async function getInsights(query: z.infer<typeof insightsQuerySchema>) {
  const days = query.days ?? 14;
  const includeDemo = query.includeDemo === "true";
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);
  const prevFrom = new Date(from);
  prevFrom.setDate(prevFrom.getDate() - days);
  const liveSince = new Date(now.getTime() - 30 * 60 * 1000);
  const q = query.q?.trim();

  const realUserWhere = includeDemo ? {} : { NOT: DEMO_EMAIL };

  const [
    visits,
    prevVisits,
    signups,
    prevSignups,
    loginEvents,
    prevLogins,
    liveVisits,
    recentVisits,
    countries,
    pages,
    recentUsers,
    onboarded,
    totalRealUsers,
  ] = await Promise.all([
    prisma.visit.findMany({
      where: { createdAt: { gte: from } },
      select: {
        createdAt: true,
        sessionId: true,
        ip: true,
        path: true,
        country: true,
        countryCode: true,
      },
    }),
    prisma.visit.count({
      where: { createdAt: { gte: prevFrom, lt: from } },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: from }, ...realUserWhere },
      select: { createdAt: true },
    }),
    prisma.user.count({
      where: { createdAt: { gte: prevFrom, lt: from }, ...realUserWhere },
    }),
    prisma.analyticsEvent.findMany({
      where: { name: "login_succeeded", createdAt: { gte: from } },
      select: { createdAt: true },
    }),
    prisma.analyticsEvent.count({
      where: { name: "login_succeeded", createdAt: { gte: prevFrom, lt: from } },
    }),
    prisma.visit.count({ where: { createdAt: { gte: liveSince } } }),
    prisma.visit.findMany({
      where: { createdAt: { gte: from } },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
          },
        },
      },
    }),
    prisma.visit.groupBy({
      by: ["country", "countryCode"],
      where: { createdAt: { gte: from }, country: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { country: "desc" } },
      take: 8,
    }),
    prisma.visit.groupBy({
      by: ["path"],
      where: { createdAt: { gte: from } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 8,
    }),
    prisma.user.findMany({
      where: {
        ...realUserWhere,
        ...(q
          ? {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { username: { contains: q, mode: "insensitive" } },
                { displayName: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        country: true,
        countryCode: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        lastSeenAt: true,
        lastLoginIp: true,
        lastLoginCountry: true,
        onboardingCompletedAt: true,
        activatedAt: true,
      },
    }),
    prisma.user.count({
      where: { onboardingCompletedAt: { not: null }, ...realUserWhere },
    }),
    prisma.user.count({ where: realUserWhere }),
  ]);

  const uniqueSessions = new Set(visits.map((v) => v.sessionId)).size;
  const uniqueIps = new Set(visits.map((v) => v.ip)).size;
  const sessionDays = new Map<string, Set<string>>();
  for (const visit of visits) {
    const key = dayKey(visit.createdAt);
    const set = sessionDays.get(key) ?? new Set();
    set.add(visit.sessionId);
    sessionDays.set(key, set);
  }

  return {
    rangeDays: days,
    includeDemo,
    generatedAt: now.toISOString(),
    totals: {
      visits: visits.length,
      uniqueSessions,
      uniqueIps,
      signups: signups.length,
      logins: loginEvents.length,
      liveVisits,
      onboarded,
      users: totalRealUsers,
    },
    previous: {
      visits: prevVisits,
      signups: prevSignups,
      logins: prevLogins,
    },
    series: {
      visits: fillDays(from, now, countByDay(visits)),
      sessions: fillDays(
        from,
        now,
        new Map([...sessionDays.entries()].map(([k, set]) => [k, set.size])),
      ),
      signups: fillDays(from, now, countByDay(signups)),
      logins: fillDays(from, now, countByDay(loginEvents)),
    },
    countries: countries.map((row) => ({
      label: row.country || "Unknown",
      code: row.countryCode,
      value: row._count._all,
    })),
    pages: pages.map((row) => ({
      label: row.path,
      value: row._count._all,
    })),
    recentVisits: recentVisits.map((v) => ({
      id: v.id,
      createdAt: v.createdAt,
      path: v.path,
      referrer: v.referrer,
      ip: v.ip,
      country: v.country,
      countryCode: v.countryCode,
      region: v.region,
      city: v.city,
      sessionId: v.sessionId,
      user: v.user,
    })),
    recentUsers,
  };
}
