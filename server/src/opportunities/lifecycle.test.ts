import assert from "node:assert/strict";
import { lifecycleStatus, shouldReconcileLifecycle } from "./lifecycle.js";

function testFailedFetchDoesNotCloseCatalog() {
  assert.equal(
    shouldReconcileLifecycle({ truncated: false, recordCount: 0, fetched: 0 }),
    false,
  );
  assert.equal(
    shouldReconcileLifecycle({ truncated: true, recordCount: 50, fetched: 1666 }),
    false,
  );
  assert.equal(
    shouldReconcileLifecycle({ truncated: false, recordCount: 1600, fetched: 1666 }),
    true,
  );
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3600_000);
}

function testSeenStaysActive() {
  assert.equal(
    lifecycleStatus({ seenThisRun: true, lastSeenAt: hoursAgo(100) }),
    "ACTIVE",
  );
}

function testMissingOneSyncStaysActive() {
  assert.equal(
    lifecycleStatus({ seenThisRun: false, lastSeenAt: hoursAgo(2) }),
    "ACTIVE",
  );
}

function testBecomesStaleThenClosed() {
  assert.equal(
    lifecycleStatus({ seenThisRun: false, lastSeenAt: hoursAgo(30) }),
    "STALE",
  );
  assert.equal(
    lifecycleStatus({ seenThisRun: false, lastSeenAt: hoursAgo(80) }),
    "CLOSED",
  );
}

testFailedFetchDoesNotCloseCatalog();
testSeenStaysActive();
testMissingOneSyncStaysActive();
testBecomesStaleThenClosed();
console.log("lifecycle.test.ts ok");
