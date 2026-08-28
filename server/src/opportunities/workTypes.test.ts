import assert from "node:assert/strict";
import { SOURCE_WORK_TYPES, WORK_TYPE_DOMAIN, workTypeLabel } from "./workTypes.js";

function testKnownTypes() {
  const keys = SOURCE_WORK_TYPES.map((row) => row.key);
  for (const key of [
    "coding",
    "rlhf-eval",
    "stem-math",
    "domain-expert",
    "multilingual",
    "data-labeling",
    "audio-speech",
    "red-teaming",
    "agentic-eval",
    "writing",
    "research-studies",
  ]) {
    assert.ok(keys.includes(key), key);
    assert.ok(WORK_TYPE_DOMAIN[key]);
  }
  assert.equal(workTypeLabel("coding"), "Coding");
  assert.equal(WORK_TYPE_DOMAIN["rlhf-eval"], "generalist");
  assert.equal(WORK_TYPE_DOMAIN["multilingual"], "translation");
  assert.equal(workTypeLabel("nope"), null);
}

testKnownTypes();
console.log("workTypes.test.ts ok");
