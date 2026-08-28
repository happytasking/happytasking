import { prisma } from "../lib/prisma.js";
import {
  AITRAINING_JOBS_SOURCE_KEY,
  AITRAINING_JOBS_SOURCE_NAME,
} from "./types.js";

export async function ensureSourceRegistry() {
  const now = new Date();
  await prisma.opportunitySource.upsert({
    where: { key: AITRAINING_JOBS_SOURCE_KEY },
    create: {
      key: AITRAINING_JOBS_SOURCE_KEY,
      name: AITRAINING_JOBS_SOURCE_NAME,
      adapter: "AITrainingJobsAdapter",
      enabled: true,
      accessMode: "AUTHORIZED_AGGREGATOR",
      syncCadenceMinutes: 60,
      priority: 10,
      allowedHosts: ["aitraining.jobs"],
      health: "UNKNOWN",
      updatedAt: now,
    },
    update: {
      enabled: true,
      accessMode: "AUTHORIZED_AGGREGATOR",
      allowedHosts: ["aitraining.jobs"],
    },
  });

  const classifiers = [
    {
      key: "greenhouse",
      name: "Greenhouse public boards",
      adapter: "GreenhouseAdapter",
      accessMode: "PUBLIC_API" as const,
      allowedHosts: ["boards-api.greenhouse.io", "job-boards.greenhouse.io"],
    },
    {
      key: "ashby",
      name: "Ashby public boards",
      adapter: "AshbyAdapter",
      accessMode: "PUBLIC_API" as const,
      allowedHosts: ["api.ashbyhq.com", "jobs.ashbyhq.com"],
    },
    {
      key: "lever",
      name: "Lever public postings",
      adapter: "LeverAdapter",
      accessMode: "PUBLIC_API" as const,
      allowedHosts: ["api.lever.co", "jobs.lever.co"],
    },
    {
      key: "workable",
      name: "Workable public boards",
      adapter: "WorkableAdapter",
      accessMode: "PUBLIC_FEED" as const,
      allowedHosts: ["apply.workable.com"],
    },
  ];

  for (const source of classifiers) {
    await prisma.opportunitySource.upsert({
      where: { key: source.key },
      create: {
        ...source,
        enabled: false,
        syncCadenceMinutes: 60,
        priority: 80,
        health: "IDLE",
        updatedAt: now,
      },
      update: { allowedHosts: source.allowedHosts },
    });
  }
}
