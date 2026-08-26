import { cache } from "react";
import { serverApi } from "./serverApi";
import { qs } from "./api";
import type {
  Company,
  CompanyTrends,
  Discussion,
  Issue,
  LiveMarket,
  MarketDashboard,
  MarketTrends,
  OpportunityDetail,
  Pagination,
  Review,
  Skill,
  TaskMatchList,
} from "./types";

export function firstQuery(
  value: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw || undefined;
}

export type HomePageData = {
  companies: Company[];
  companyTotal: number;
  reviews: Review[];
  skills: Skill[];
  liveMarket: LiveMarket;
  market: MarketDashboard;
  trends: MarketTrends | null;
  domainCount: number;
};

export type PaginatedList<T> = {
  items: T[];
  pagination: Pagination;
};

export type CompareSide = {
  company: Company;
  trends: CompanyTrends | null;
};

export type ComparePageData = {
  options: Company[];
  a: CompareSide | null;
  b: CompareSide | null;
};

export const loadHomePage = cache(async (): Promise<HomePageData> => {
  const [companyRes, latest, skillRes, liveRes, marketRes, trendRes] =
    await Promise.all([
      serverApi<{ items: Company[]; pagination: Pagination }>(
        `/companies${qs({ sort: "score", period: "90d", limit: 10 })}`,
      ),
      serverApi<Review[]>("/reviews/latest"),
      serverApi<Skill[]>("/companies/meta/skills"),
      serverApi<LiveMarket>("/market/live"),
      serverApi<MarketDashboard>("/market"),
      serverApi<MarketTrends>("/market/trends").catch(() => null),
    ]);

  return {
    companies: companyRes.items,
    companyTotal: companyRes.pagination.total,
    reviews: latest.slice(0, 4),
    skills: skillRes.slice(0, 12),
    liveMarket: liveRes,
    market: marketRes,
    trends: trendRes,
    domainCount: marketRes.medianEffectiveByDomain.length,
  };
});

export const loadMarketPage = cache(async () => {
  const [market, trends] = await Promise.all([
    serverApi<MarketDashboard>("/market"),
    serverApi<MarketTrends>("/market/trends").catch(() => null),
  ]);
  return { market, trends };
});

export const loadCommunityList = cache(
  async (filters: {
    sort?: string;
    company?: string;
    page?: number;
  } = {}): Promise<PaginatedList<Discussion>> => {
    return serverApi<PaginatedList<Discussion>>(
      `/community${qs({
        sort: filters.sort || "trending",
        company: filters.company,
        page: filters.page || 1,
        limit: 20,
      })}`,
    );
  },
);

export const loadIssueList = cache(
  async (filters: {
    company?: string;
    page?: number;
  } = {}): Promise<PaginatedList<Issue>> => {
    return serverApi<PaginatedList<Issue>>(
      `/issues${qs({
        company: filters.company,
        page: filters.page || 1,
        limit: 20,
      })}`,
    );
  },
);

export const loadPublicTaskMatch = cache(async (): Promise<TaskMatchList> => {
  return serverApi<TaskMatchList>(
    `/taskmatch${qs({ sort: "recommended", includeWorkedWith: "true" })}`,
  );
});

export const loadDiscussion = cache(async (id: string) => {
  return serverApi<Discussion>(`/community/${id}`);
});

export const loadIssue = cache(async (publicId: string) => {
  return serverApi<Issue>(`/issues/${publicId}`);
});

export const loadOpportunity = cache(async (slug: string) => {
  return serverApi<OpportunityDetail>(`/taskmatch/opportunities/${slug}`);
});

async function loadCompareSide(slug?: string): Promise<CompareSide | null> {
  if (!slug) return null;
  try {
    const [company, trends] = await Promise.all([
      serverApi<Company>(`/companies/${slug}${qs({ period: "90d" })}`),
      serverApi<CompanyTrends>(`/companies/${slug}/trends`).catch(() => null),
    ]);
    return { company, trends };
  } catch {
    return null;
  }
}

export const loadComparePage = cache(
  async (a?: string, b?: string): Promise<ComparePageData> => {
    const list = await serverApi<{ items: Company[]; pagination: Pagination }>(
      `/companies${qs({ limit: 100, sort: "score", period: "90d" })}`,
    );
    const [sideA, sideB] = await Promise.all([
      loadCompareSide(a),
      loadCompareSide(b),
    ]);
    return { options: list.items, a: sideA, b: sideB };
  },
);
