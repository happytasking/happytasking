import assert from "node:assert/strict";
import {
  acquireOpportunitySyncLock,
  releaseOpportunitySyncLock,
} from "./lock.js";

const lockId = `opportunity-sync-test-${process.pid}`;

async function testOverlappingLock() {
  const a = await acquireOpportunitySyncLock("run-a", lockId);
  assert.equal(a.acquired, true);
  try {
    const b = await acquireOpportunitySyncLock("run-b", lockId);
    assert.equal(b.acquired, false);
  } finally {
    await releaseOpportunitySyncLock(a.token, lockId);
  }
  const c = await acquireOpportunitySyncLock("run-c", lockId);
  assert.equal(c.acquired, true);
  await releaseOpportunitySyncLock(c.token, lockId);
}

await testOverlappingLock();
console.log("lock.test.ts ok");
