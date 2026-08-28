import assert from "node:assert/strict";
import { lifecycleStatus } from "./lifecycle.js";

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

testSeenStaysActive();
testMissingOneSyncStaysActive();
testBecomesStaleThenClosed();
console.log("lifecycle.test.ts ok");
