"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type QueryValue = string | number | null | undefined;

/**
 * Soft URL updates for filter UIs. Updates the query string without a document
 * reload or scroll jump, then lets existing useEffect loaders refetch data.
 */
export function useSoftQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setQuery = useCallback(
    (
      patch: Record<string, QueryValue>,
      options?: {
        /** Default false — filter tweaks should not flood the back button. */
        push?: boolean;
        /** When true (default), changing filters resets pagination. */
        resetPage?: boolean;
      },
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      if (options?.resetPage !== false && !("page" in patch)) {
        params.delete("page");
      }

      const qs = params.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      const navigate = options?.push ? router.push : router.replace;
      navigate(href, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { searchParams, setQuery };
}
