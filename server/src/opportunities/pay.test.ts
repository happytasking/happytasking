import assert from "node:assert/strict";
import { listingPayFromSource, parseCompensationText } from "./pay.js";

function testParsesListingRange() {
  const pay = parseCompensationText("$$50-$100/hr");
  assert.equal(pay.minRate, 50);
  assert.equal(pay.maxRate, 100);
  assert.equal(pay.unit, "HOURLY");
  assert.ok(pay.rawText?.startsWith("$50"));
}

function testParsesHourWords() {
  const pay = parseCompensationText("$$35/hour - $45/hour");
  assert.equal(pay.minRate, 35);
  assert.equal(pay.maxRate, 45);
}

function testMissingPayIsNotZero() {
  const pay = parseCompensationText("");
  assert.equal(pay.minRate, null);
  assert.equal(pay.maxRate, null);
  const fromPlatform = listingPayFromSource({
    compensationText: null,
    platformPayLow: 44,
    platformPayHigh: 92,
  });
  assert.equal(fromPlatform.minRate, null);
  assert.equal(fromPlatform.maxRate, null);
}

testParsesListingRange();
testParsesHourWords();
testMissingPayIsNotZero();
console.log("pay.test.ts ok");
