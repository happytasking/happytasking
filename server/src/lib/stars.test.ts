import assert from "node:assert/strict";
import { scoreToStars } from "./stars.js";

assert.equal(scoreToStars(null), null);
assert.equal(scoreToStars(undefined), null);
assert.equal(scoreToStars(0), 0);
assert.equal(scoreToStars(68), 3);
assert.equal(scoreToStars(70), 4);
assert.equal(scoreToStars(82), 4);
assert.equal(scoreToStars(100), 5);
console.log("stars tests passed");
