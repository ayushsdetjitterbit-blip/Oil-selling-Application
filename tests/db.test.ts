/**
 * Database integration tests. They run only when TEST_DATABASE_URL points at a
 * throwaway Postgres database (every table in it is emptied first):
 *   TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:5544/natural_oil_test npm test
 */
import { before, after, test } from "node:test";
import assert from "node:assert/strict";

const url = process.env.TEST_DATABASE_URL;
const skip = !url && "set TEST_DATABASE_URL to run database tests";

type Orders = typeof import("../src/lib/orders");
type Reviews = typeof import("../src/lib/reviews");
type Db = typeof import("../src/lib/db");
let orders: Orders, reviews: Reviews, db: Db;

const customer = { name: "Asha Rao", phone: "9876543210", email: "asha@example.com", address: "12 Temple Road", city: "Chennai", state: "Tamil Nadu", pincode: "600004" };
const line = (variantId: string, qty: number, unitPrice: number) => ({ variantId, slug: variantId.split(":")[0], name: "Test Oil", sizeLabel: variantId.split(":")[1], unitPrice, qty, total: unitPrice * qty });
const totals = (lines: ReturnType<typeof line>[]) => {
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  return { lines, subtotal, discount: 0, shipping: 0, total: subtotal, couponApplied: null };
};
const stock = async (id: string) => (await db.query<{ stock: number }>("SELECT stock FROM variants WHERE id = $1", [id]))[0].stock;
const setStock = (id: string, n: number) => db.query("UPDATE variants SET stock = $2 WHERE id = $1", [id, n]);

before(async () => {
  if (!url) return;
  process.env.DATABASE_URL = url;
  db = await import("../src/lib/db");
  orders = await import("../src/lib/orders");
  reviews = await import("../src/lib/reviews");
  await db.query("SELECT 1"); // creates the schema
  await db.query("TRUNCATE reviews, order_events, order_items, orders, subscribers");
});

after(async () => {
  const g = globalThis as { __noPool?: { end: () => Promise<void> } };
  await g.__noPool?.end();
});

test("paying reserves stock, and a sold-out size is refused", { skip }, async () => {
  await setStock("groundnut-oil:1l", 3);
  const a = await orders.createOrder(customer, totals([line("groundnut-oil:1l", 2, 449)]));
  assert.deepEqual(await orders.payOrder(a.id, { method: "cod" }), { ok: true });
  assert.equal(await stock("groundnut-oil:1l"), 1);

  const b = await orders.createOrder(customer, totals([line("groundnut-oil:1l", 2, 449)]));
  const res = await orders.payOrder(b.id, { method: "cod" });
  assert.equal(res.ok, false);
  assert.equal(res.ok === false && res.status, 409);
  assert.equal(await stock("groundnut-oil:1l"), 1, "a refused order must not touch stock");
});

test("two customers racing for the last bottle: exactly one wins", { skip }, async () => {
  await setStock("sesame-oil:1l", 1);
  const [a, b] = await Promise.all([1, 2].map(() => orders.createOrder(customer, totals([line("sesame-oil:1l", 1, 549)]))));
  const results = await Promise.all([orders.payOrder(a.id, { method: "cod" }), orders.payOrder(b.id, { method: "cod" })]);
  assert.equal(results.filter((r) => r.ok).length, 1);
  assert.equal(await stock("sesame-oil:1l"), 0);
});

test("a declined card puts the stock back and the order can be paid again", { skip }, async () => {
  await setStock("coconut-oil:500ml", 5);
  const o = await orders.createOrder(customer, totals([line("coconut-oil:500ml", 2, 399)]));
  const declined = await orders.payOrder(o.id, { method: "card", number: "4111111111110000", name: "Asha", expiry: "08/29", cvv: "123" });
  assert.equal(declined.ok, false);
  assert.equal(await stock("coconut-oil:500ml"), 5);
  assert.equal((await orders.getOrder(o.id))?.paymentStatus, "failed");
  assert.deepEqual(await orders.payOrder(o.id, { method: "upi", upiId: "asha@okbank" }), { ok: true });
  const paid = await orders.getOrder(o.id);
  assert.equal(paid?.status, "confirmed");
  assert.equal(paid?.paymentStatus, "paid");
  assert.equal(await stock("coconut-oil:500ml"), 3);
  assert.deepEqual(await orders.payOrder(o.id, { method: "cod" }), { ok: false, status: 409, error: "This order is already confirmed" });
});

test("status moves one step at a time; delivery collects COD; reviews only after delivery", { skip }, async () => {
  await setStock("mustard-oil:1l", 10);
  const o = await orders.createOrder(customer, totals([line("mustard-oil:1l", 1, 449)]));
  await orders.payOrder(o.id, { method: "cod" });
  assert.match((await orders.changeOrderStatus(o.id, "shipped")) ?? "", /Can't move/);
  assert.equal(await reviews.addReview({ orderId: o.id, slug: "mustard-oil", rating: 5, body: "Lovely sharp mustard oil" }), "You can write a review once your order has been delivered");
  for (const s of ["packed", "shipped", "delivered"] as const) assert.equal(await orders.changeOrderStatus(o.id, s), null);
  const done = await orders.getOrder(o.id);
  assert.equal(done?.paymentStatus, "paid");
  assert.deepEqual(done?.events.map((e) => e.status), ["placed", "confirmed", "packed", "shipped", "delivered"]);
  assert.equal(await reviews.addReview({ orderId: o.id, slug: "groundnut-oil", rating: 5, body: "Not in this order at all" }), "That oil isn't part of this order");
  assert.equal(await reviews.addReview({ orderId: o.id, slug: "mustard-oil", rating: 5, body: "Lovely sharp mustard oil" }), null);
  assert.equal(await reviews.addReview({ orderId: o.id, slug: "mustard-oil", rating: 4, body: "Trying to review twice" }), "You've already reviewed this oil");
  const { reviews: list } = await reviews.getProductReviews("mustard-oil");
  assert.equal(list[0].name, "Asha R.");
  assert.match((await orders.changeOrderStatus(o.id, "cancelled")) ?? "", /can't be cancelled/);
});

test("cancelling a paid order restores stock and marks it refunded", { skip }, async () => {
  await setStock("castor-oil:250ml", 4);
  const o = await orders.createOrder(customer, totals([line("castor-oil:250ml", 3, 279)]));
  await orders.payOrder(o.id, { method: "upi", upiId: "asha@okbank" });
  assert.equal(await stock("castor-oil:250ml"), 1);
  assert.equal(await orders.changeOrderStatus(o.id, "cancelled"), null);
  assert.equal(await stock("castor-oil:250ml"), 4);
  assert.equal((await orders.getOrder(o.id))?.paymentStatus, "refunded");
});
