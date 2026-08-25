import { prisma } from "../lib/prisma.js";
import { isPublicIp } from "../lib/requestMeta.js";

export type GeoResult = {
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
};

const memory = new Map<string, { geo: GeoResult; at: number }>();
const MEMORY_TTL_MS = 6 * 60 * 60 * 1000;

export async function lookupGeo(ip: string): Promise<GeoResult> {
  if (!isPublicIp(ip)) {
    return { country: "Local network", countryCode: null, region: null, city: null };
  }

  const mem = memory.get(ip);
  if (mem && Date.now() - mem.at < MEMORY_TTL_MS) return mem.geo;

  const cached = await prisma.geoCache.findUnique({ where: { ip } });
  if (cached && Date.now() - cached.updatedAt.getTime() < MEMORY_TTL_MS) {
    const geo = {
      country: cached.country,
      countryCode: cached.countryCode,
      region: cached.region,
      city: cached.city,
    };
    memory.set(ip, { geo, at: Date.now() });
    return geo;
  }

  const geo = await fetchGeo(ip);
  memory.set(ip, { geo, at: Date.now() });
  await prisma.geoCache.upsert({
    where: { ip },
    create: { ip, ...geo },
    update: geo,
  });
  return geo;
}

async function fetchGeo(ip: string): Promise<GeoResult> {
  const empty: GeoResult = {
    country: null,
    countryCode: null,
    region: null,
    city: null,
  };
  try {
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city`;
    const res = await fetch(url, { signal: AbortSignal.timeout(1800) });
    if (!res.ok) return empty;
    const data = (await res.json()) as {
      status?: string;
      country?: string;
      countryCode?: string;
      regionName?: string;
      city?: string;
    };
    if (data.status !== "success") return empty;
    return {
      country: data.country || null,
      countryCode: data.countryCode || null,
      region: data.regionName || null,
      city: data.city || null,
    };
  } catch {
    return empty;
  }
}
