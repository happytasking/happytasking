import assert from "node:assert/strict";
import { opportunityPay } from "./opportunityPay";

function testHourlyRange() {
  const pay = opportunityPay({
    minRate: 80,
    maxRate: 120,
    currency: "USD",
    rateUnit: "HOURLY",
  });
  assert.ok(pay);
  assert.ok(pay.amount.includes("80"));
  assert.ok(pay.amount.includes("120"));
  assert.equal(pay.unit, "per hour");
  assert.ok(/hour/i.test(pay.aria));
}

function testTaskUnitNotConverted() {
  const pay = opportunityPay({
    minRate: 20,
    maxRate: 20,
    currency: "USD",
    rateUnit: "PER_TASK",
  });
  assert.equal(pay?.unit, "per task");
}

function testMissingIsNull() {
  assert.equal(opportunityPay({ minRate: null, maxRate: null }), null);
}

testHourlyRange();
testTaskUnitNotConverted();
testMissingIsNull();
console.log("opportunityPay.test.ts ok");
