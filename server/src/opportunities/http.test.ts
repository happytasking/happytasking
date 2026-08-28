import assert from "node:assert/strict";
import { isPrivateHostname } from "./urls.js";

function testBlocksPrivateHosts() {
  assert.equal(isPrivateHostname("127.0.0.1"), true);
  assert.equal(isPrivateHostname("10.0.0.5"), true);
  assert.equal(isPrivateHostname("192.168.1.9"), true);
  assert.equal(isPrivateHostname("localhost"), true);
  assert.equal(isPrivateHostname("aitraining.jobs"), false);
}

testBlocksPrivateHosts();
console.log("http.test.ts ok");
