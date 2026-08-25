"use client";

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

/** Best-effort named event. Failures are silent — never block navigation. */
export function track(name: string) {
  void api("/analytics/event", {
    method: "POST",
    body: { name, sessionId: sessionId() },
  }).catch(() => undefined);
}
