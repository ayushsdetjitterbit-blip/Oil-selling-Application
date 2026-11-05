import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTotals } from "../src/lib/pricing";

test("charges shipping below the free-shipping threshold", () => {
  const t = computeTotals([{ variantId: "groundnut-oil:500ml", qty: 1 }]);
  assert.equal(t.subtotal, 249);
  assert.equal(t.shipping, 60);
  assert.equal(t.total, 309);
});

test("free shipping at or above 999 after discount", () => {
  const t = computeTotals([{ variantId: "groundnut-oil:5l", qty: 1 }]);
  assert.equal(t.shipping, 0);
});

test("applies coupon case-insensitively; ignores unknown coupons", () => {
  assert.equal(computeTotals([{ variantId: "groundnut-oil:5l", qty: 1 }], "kolhu10").discount, 210);
  assert.equal(computeTotals([{ variantId: "groundnut-oil:5l", qty: 1 }], "FAKE").discount, 0);
});

test("drops unknown variants and clamps quantity", () => {
  const t = computeTotals([{ variantId: "nope:1l", qty: 3 }, { variantId: "sesame-oil:1l", qty: 999 }]);
  assert.equal(t.lines.length, 1);
  assert.equal(t.lines[0].qty, 20);
});
