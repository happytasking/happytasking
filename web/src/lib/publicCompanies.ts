import { cache } from "react";
import { serverApi } from "./serverApi";
import { qs } from "./api";
import type { Company, Domain, Pagination, Review } from "./types";

export type CompanyDirectory = {
  items: Company[];
  pagination: Pagination;
  domains: Domain[];
};

export const loadCompanyDirectory = cache(
  async (filters: {
    search?: string;
    sort?: string;
    period?: string;
    domain?: string;
    page?: number;
  } = {}): Promise<CompanyDirectory> => {
    const [list, domains] = await Promise.all([
      serverApi<{ items: Company[]; pagination: Pagination }>(
        `/companies${qs({
          search: filters.search,
          sort: filters.sort || "score",
          period: filters.period || "90d",
          domain: filters.domain,
          page: filters.page || 1,
          limit: 20,
        })}`,
      ),
      serverApi<Domain[]>("/companies/meta/domains"),
    ]);
    return { items: list.items, pagination: list.pagination, domains };
  },
);

export const loadCompany = cache(async (slug: string, period = "90d") => {
  return serverApi<Company>(`/companies/${slug}${qs({ period })}`);
});

export const loadCompanyReviews = cache(
  async (slug: string, limit = 8): Promise<{ items: Review[]; pagination: Pagination }> => {
    return serverApi<{ items: Review[]; pagination: Pagination }>(
      `/reviews/company/${slug}${qs({ page: 1, limit })}`,
    );
  },
);
