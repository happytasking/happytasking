import assert from "node:assert/strict";
import {
  curatedCompanyLogo,
  faviconLogoUrl,
  resolveCompanyLogoUrl,
  resolveCompanyWebsite,
} from "./logos.js";

function testCuratedBeatsFavicon() {
  const url = resolveCompanyLogoUrl({
    slug: "appen",
    existing: null,
    website: "https://appen.com",
  });
  assert.equal(url, "/logos/appen.svg");
  assert.equal(curatedCompanyLogo("mercor"), null);
}

function testExistingLogoWins() {
  assert.equal(
    resolveCompanyLogoUrl({
      slug: "mercor",
      existing: "https://cdn.example/mercor.png",
      website: "https://mercor.com",
    }),
    "https://cdn.example/mercor.png",
  );
}

function testFaviconFromOfficialDomain() {
  const url = resolveCompanyLogoUrl({ slug: "mercor", existing: null });
  assert.equal(resolveCompanyWebsite("mercor", null), "https://mercor.com");
  assert.ok(url?.includes("google.com/s2/favicons"));
  assert.ok(url?.includes("mercor.com"));
  assert.equal(faviconLogoUrl("not a url"), null);
}

function testUnknownCompanyFallsBack() {
  assert.equal(
    resolveCompanyLogoUrl({ slug: "unknown-platform-xyz", existing: null }),
    null,
  );
}

testCuratedBeatsFavicon();
testExistingLogoWins();
testFaviconFromOfficialDomain();
testUnknownCompanyFallsBack();
console.log("logos.test.ts ok");
