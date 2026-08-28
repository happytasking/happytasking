import assert from "node:assert/strict";
import { classifyPrimarySource } from "../provenance.js";
import { ashbyBoardUrl, greenhouseJobApiUrl, leverPostingsUrl } from "./ats.js";

function testGreenhouseApi() {
  const guess = classifyPrimarySource(
    "https://job-boards.greenhouse.io/xai/jobs/5207427007",
  );
  assert.equal(
    greenhouseJobApiUrl(guess),
    "https://boards-api.greenhouse.io/v1/boards/xai/jobs/5207427007",
  );
}

function testAshbyAndLever() {
  assert.ok(
    ashbyBoardUrl(
      classifyPrimarySource("https://jobs.ashbyhq.com/afterquery/abc"),
    )?.includes("afterquery"),
  );
  assert.ok(
    leverPostingsUrl(
      classifyPrimarySource("https://jobs.lever.co/mindrift/abc"),
    )?.includes("mindrift"),
  );
}

testGreenhouseApi();
testAshbyAndLever();
console.log("ats.test.ts ok");
