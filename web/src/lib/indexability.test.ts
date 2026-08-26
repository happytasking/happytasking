import assert from "node:assert/strict";
import { siteUrl } from "./site";
import {
  PRIVATE_PREFIXES,
  isPrivatePath,
  robotsDisallowPaths,
  STATIC_PUBLIC_ROUTES,
} from "./indexability";

function testPrivatePaths() {
  assert.equal(isPrivatePath("/login"), true);
  assert.equal(isPrivatePath("/register"), true);
  assert.equal(isPrivatePath("/onboarding/skills"), true);
  assert.equal(isPrivatePath("/profile"), true);
  assert.equal(isPrivatePath("/moderation/insights"), true);
  assert.equal(isPrivatePath("/taskmatch/profile"), true);
  assert.equal(isPrivatePath("/reviews/new"), true);
  assert.equal(isPrivatePath("/issues/new"), true);
  assert.equal(isPrivatePath("/"), false);
  assert.equal(isPrivatePath("/companies"), false);
  assert.equal(isPrivatePath("/companies/outlier"), false);
  assert.equal(isPrivatePath("/taskmatch"), false);
  assert.equal(isPrivatePath("/issues"), false);
}

function testRobotsDisallow() {
  const disallow = robotsDisallowPaths();
  assert.ok(disallow.includes("/api/"));
  for (const prefix of PRIVATE_PREFIXES) {
    assert.ok(disallow.includes(prefix), `missing ${prefix}`);
  }
}

function testSitemapDoesNotIncludePrivateOrDemoPolicy() {
  const paths = STATIC_PUBLIC_ROUTES.map((route) => route.path);
  for (const prefix of PRIVATE_PREFIXES) {
    assert.ok(!paths.includes(prefix), `${prefix} must not be in the sitemap`);
  }
  assert.ok(paths.includes("/"));
  assert.ok(paths.includes("/companies"));
  assert.ok(!paths.some((path) => path.startsWith("/companies/")));
  assert.ok(paths.includes("/compare"));
  assert.ok(!paths.some((path) => path.startsWith("/compare/")));
  assert.ok(paths.includes("/taskmatch"));
  assert.ok(paths.includes("/guides"));
  assert.ok(!paths.includes("/jobs"));
  assert.ok(!paths.includes("/ai-training-jobs"));
  assert.ok(!paths.some((path) => path.startsWith("/taskmatch/remote")));
  assert.ok(!paths.some((path) => path.startsWith("/taskmatch/coding")));
  assert.ok(!paths.some((path) => path.startsWith("/guides/")));
}

function testHomepageSiteUrlHasTrailingSlash() {
  assert.equal(siteUrl("/"), "https://happytasking.com/");
  assert.equal(siteUrl("/companies"), "https://happytasking.com/companies");
}

testPrivatePaths();
testRobotsDisallow();
testSitemapDoesNotIncludePrivateOrDemoPolicy();
testHomepageSiteUrlHasTrailingSlash();
console.log("indexability.test.ts ok");
