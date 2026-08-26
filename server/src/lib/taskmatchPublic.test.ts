import assert from "node:assert/strict";
import {
  hasPublicCommunityIntelligence,
  isPublicOpportunityCatalogItem,
  publicOpportunityCatalogWhere,
  taskPulseReportScope,
} from "./taskmatchPublic.js";

function testCatalogWhere() {
  const where = publicOpportunityCatalogWhere();
  assert.equal(where.status, "ACTIVE");
  assert.equal(where.isDemo, false);
  assert.equal(where.company.isDemo, false);
  assert.equal(where.company.companyStatus, "ACTIVE");
  const mercor = publicOpportunityCatalogWhere("mercor");
  assert.equal(mercor.company.slug, "mercor");
}

function testCatalogGate() {
  assert.equal(
    isPublicOpportunityCatalogItem({
      isDemo: true,
      status: "ACTIVE",
      company: { isDemo: false, companyStatus: "ACTIVE" },
    }),
    false,
  );
  assert.equal(
    isPublicOpportunityCatalogItem({
      isDemo: false,
      status: "ACTIVE",
      company: { isDemo: true, companyStatus: "ACTIVE" },
    }),
    false,
  );
  assert.equal(
    isPublicOpportunityCatalogItem({
      isDemo: false,
      status: "PAUSED",
      company: { isDemo: false, companyStatus: "ACTIVE" },
    }),
    false,
  );
  assert.equal(
    isPublicOpportunityCatalogItem({
      isDemo: false,
      status: "ACTIVE",
      company: { isDemo: false, companyStatus: "ACTIVE" },
    }),
    true,
  );
}

function testPublicPulseIgnoresDemo() {
  const publicScope = taskPulseReportScope("co1", { realOnly: true });
  assert.equal(publicScope.isDemo, false);
  const internal = taskPulseReportScope("co1", { realOnly: false });
  assert.equal("isDemo" in internal, false);
}

function testMissingIntelligenceIsNotZero() {
  assert.equal(
    hasPublicCommunityIntelligence({
      taskScore: null,
      pulseAvailability: null,
      qualityScore: null,
      qualityInsufficient: true,
    }),
    false,
  );
  assert.equal(
    hasPublicCommunityIntelligence({
      taskScore: 72,
      pulseAvailability: null,
      qualityScore: 70,
      qualityInsufficient: false,
    }),
    true,
  );
}

testCatalogWhere();
testCatalogGate();
testPublicPulseIgnoresDemo();
testMissingIntelligenceIsNotZero();
console.log("taskmatchPublic.test.ts ok");
