import assert from "node:assert/strict";
import {
  hasPublicCommunityIntelligence,
  isPublicOpportunityCatalogItem,
  publicEvidenceWhere,
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
  const defaultPublic = taskPulseReportScope("co1");
  assert.equal(defaultPublic.isDemo, false);
  const internal = taskPulseReportScope("co1", { realOnly: false });
  assert.equal("isDemo" in internal, false);
}

function testRealCompanyDemoReviewsNeverCountAsPublicEvidence() {
  assert.deepEqual(publicEvidenceWhere(false), { isDemo: false });
}

function testRealCompanyDemoPayReportsNeverCountAsPublicEvidence() {
  assert.deepEqual(publicEvidenceWhere(false), { isDemo: false });
}

function testRealCompanyDemoTaskPulseNeverCountsAsPublicEvidence() {
  const scope = taskPulseReportScope("converted-real-company");
  assert.equal(scope.isDemo, false);
  assert.equal(taskPulseReportScope("converted-real-company", { realOnly: true }).isDemo, false);
}

function testDemoCompanyPagesMayStillShowOwnDemoEvidence() {
  assert.deepEqual(publicEvidenceWhere(true), {});
  assert.equal("isDemo" in taskPulseReportScope("demo-co", { realOnly: false }), false);
}

function testRealCompanyNeverIngestsDemoEvidence() {
  assert.deepEqual(publicEvidenceWhere(false), { isDemo: false });
  assert.deepEqual(publicEvidenceWhere(undefined), { isDemo: false });
  assert.deepEqual(publicEvidenceWhere(true), {});
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
testRealCompanyNeverIngestsDemoEvidence();
testRealCompanyDemoReviewsNeverCountAsPublicEvidence();
testRealCompanyDemoPayReportsNeverCountAsPublicEvidence();
testRealCompanyDemoTaskPulseNeverCountsAsPublicEvidence();
testDemoCompanyPagesMayStillShowOwnDemoEvidence();
testMissingIntelligenceIsNotZero();
console.log("taskmatchPublic.test.ts ok");
