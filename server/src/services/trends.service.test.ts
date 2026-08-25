import assert from "node:assert/strict";
import { dailyAvailability, monthlyPay } from "./trends.service.js";

const NOW = new Date("2026-08-16T12:00:00.000Z");

function daysBefore(n: number) {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  d.setHours(9, 0, 0, 0);
  return d;
}

function testAvailabilityBuckets() {
  const days = dailyAvailability(
    [
      { reportDate: daysBefore(0), availabilityStatus: "HIGH" },
      { reportDate: daysBefore(0), availabilityStatus: "MODERATE" },
      { reportDate: daysBefore(2), availabilityStatus: "NO_TASKS" },
    ],
    NOW,
    5,
  );

  assert.equal(days.length, 5);
  const today = days[days.length - 1];
  assert.equal(today.sampleSize, 2);
  assert.equal(today.counts.HIGH, 1);
  assert.equal(today.counts.MODERATE, 1);
  // HIGH=4, MODERATE=3 → mean 3.5 → (3.5-1)/3*100 ≈ 83
  assert.equal(today.index, 83);

  const noTasksDay = days[days.length - 3];
  assert.equal(noTasksDay.index, 0);

  const emptyDay = days[days.length - 2];
  assert.equal(emptyDay.sampleSize, 0);
  assert.equal(emptyDay.index, null);
}

function testMonthlyPay() {
  const points = monthlyPay(
    [
      { createdAt: daysBefore(1), advertisedRate: 40, effectiveRate: 30 },
      { createdAt: daysBefore(2), advertisedRate: 50, effectiveRate: null },
      { createdAt: daysBefore(120), advertisedRate: 20, effectiveRate: 10 },
    ],
    NOW,
    6,
  );

  assert.equal(points.length, 6);
  const current = points[points.length - 1];
  assert.equal(current.advertised, 45);
  assert.equal(current.effective, 30);
  assert.equal(current.sampleSize, 2);

  const untouched = points[0];
  assert.equal(untouched.advertised, null);
  assert.equal(untouched.sampleSize, 0);
}

testAvailabilityBuckets();
testMonthlyPay();
console.log("trends.service tests passed");
