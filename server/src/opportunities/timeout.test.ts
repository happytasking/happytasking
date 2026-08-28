import assert from "node:assert/strict";
import { withTimeout } from "./timeout.js";

async function testResolvesAndClearsTimer() {
  const start = Date.now();
  const value = await withTimeout(Promise.resolve(7), 60_000, "should not fire");
  assert.equal(value, 7);
  assert.ok(Date.now() - start < 1_000);
}

async function testRejectsWhenOverBudget() {
  await assert.rejects(
    () =>
      withTimeout(
        new Promise((resolve) => {
          setTimeout(() => resolve("late"), 50);
        }),
        5,
        "timed out",
      ),
    /timed out/,
  );
}

await testResolvesAndClearsTimer();
await testRejectsWhenOverBudget();
console.log("timeout.test.ts ok");
