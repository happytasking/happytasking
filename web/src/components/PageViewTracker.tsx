"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

const SESSION_KEY = "ht_sid";

function sessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const last = useRef<string>("");

  useEffect(() => {
    const path = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    if (last.current === path) return;
    last.current = path;
    void api("/analytics/pageview", {
      method: "POST",
      body: {
        path: pathname,
        referrer: document.referrer || null,
        sessionId: sessionId(),
      },
    }).catch(() => undefined);
  }, [pathname, searchParams]);

  return null;
}
