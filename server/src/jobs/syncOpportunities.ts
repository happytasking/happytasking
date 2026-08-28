import { prisma } from "../lib/prisma.js";
import { syncOpportunities } from "../opportunities/sync.js";

function arg(name: string) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

const maxRecords = arg("max-records") ? Number(arg("max-records")) : undefined;
const trigger = arg("trigger") || (process.env.INVOCATION_ID ? "cron" : "manual");

try {
  const outcome = await syncOpportunities({
    trigger,
    maxRecords: Number.isFinite(maxRecords) ? maxRecords : undefined,
    holder: trigger,
  });

  console.log(
    JSON.stringify(
      {
        skippedLocked: outcome.skippedLocked,
        runId: outcome.runId,
        status: outcome.status,
        durationMs: outcome.durationMs,
        sources: outcome.sources,
      },
      null,
      2,
    ),
  );

  if (outcome.status === "FAILED") process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
