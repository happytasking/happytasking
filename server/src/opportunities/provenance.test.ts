import assert from "node:assert/strict";
import { classifyPrimarySource, provenanceLabels } from "./provenance.js";

function testGreenhouseIsOfficial() {
  const guess = classifyPrimarySource(
    "https://job-boards.greenhouse.io/xai/jobs/5207427007",
  );
  assert.equal(guess.kind, "greenhouse");
  assert.equal(guess.official, true);
  assert.equal(guess.jobId, "5207427007");
  const labels = provenanceLabels({
    discoverySource: "AITraining.jobs",
    primary: guess,
  });
  assert.equal(labels.sourceLabel, "Official public listing");
  assert.ok(labels.discoveryNote?.includes("AITraining.jobs"));
}

function testAggregatorOnlyIsHonest() {
  const guess = classifyPrimarySource("https://aitraining.jobs/not-a-job");
  const labels = provenanceLabels({
    discoverySource: "AITraining.jobs",
    primary: guess,
  });
  assert.equal(labels.sourceType, "AUTHORIZED_AGGREGATOR");
  assert.equal(labels.sourceLabel, "Discovered through AITraining.jobs");
}

function testDoesNotInventOfficial() {
  const guess = classifyPrimarySource(null);
  assert.equal(guess.official, false);
}

testGreenhouseIsOfficial();
testAggregatorOnlyIsHonest();
testDoesNotInventOfficial();
console.log("provenance.test.ts ok");
