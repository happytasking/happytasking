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

    const named: Record<string, string> = {
      "/open-source": "open_source_page_viewed",
      "/manifesto": "manifesto_viewed",
      "/methodology": "methodology_viewed",
      "/governance": "governance_viewed",
    };
    const event = named[pathname];
    if (event) {
      void api("/analytics/event", {
        method: "POST",
        body: { name: event, sessionId: sessionId() },
      }).catch(() => undefined);
    }
  }, [pathname, searchParams]);

  return null;
}
