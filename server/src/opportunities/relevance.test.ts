import assert from "node:assert/strict";
import { classifyRelevance } from "./relevance.js";

function testAcceptsKnownWorkType() {
  const d = classifyRelevance({
    title: "Hardware Expert",
    workType: "rlhf-eval",
  });
  assert.equal(d.status, "ACCEPTED");
}

function testRejectsAccountant() {
  const d = classifyRelevance({
    title: "Accountant at an AI company",
    workType: null,
  });
  assert.equal(d.status, "REJECTED");
}

function testQuarantinesUncertain() {
  const d = classifyRelevance({ title: "Operations associate" });
  assert.equal(d.status, "QUARANTINED");
}

testAcceptsKnownWorkType();
testRejectsAccountant();
testQuarantinesUncertain();
console.log("relevance.test.ts ok");
