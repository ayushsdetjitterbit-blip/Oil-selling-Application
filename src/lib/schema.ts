import { PRODUCTS } from "./products";

type Queryable = { query: (text: string, params?: unknown[]) => Promise<unknown> };

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS variants (
  id            TEXT PRIMARY KEY,
  product_slug  TEXT NOT NULL,
  price         INTEGER NOT NULL CHECK (price > 0),
  mrp           INTEGER NOT NULL CHECK (mrp > 0),
  stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  status          TEXT NOT NULL,
  payment_status  TEXT NOT NULL,
  payment_method  TEXT,
  payment_ref     TEXT,
  stock_reserved  BOOLEAN NOT NULL DEFAULT false,
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT NOT NULL,
  address         TEXT NOT NULL,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  pincode         TEXT NOT NULL,
  subtotal        INTEGER NOT NULL,
  discount        INTEGER NOT NULL,
  shipping        INTEGER NOT NULL,
  total           INTEGER NOT NULL,
  coupon          TEXT
);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

CREATE TABLE IF NOT EXISTS order_items (
  order_id      TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id    TEXT NOT NULL,
  product_slug  TEXT NOT NULL,
  name          TEXT NOT NULL,
  size_label    TEXT NOT NULL,
  unit_price    INTEGER NOT NULL,
  qty           INTEGER NOT NULL CHECK (qty > 0),
  PRIMARY KEY (order_id, variant_id)
);

CREATE TABLE IF NOT EXISTS order_events (
  id          BIGSERIAL PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_events_order_idx ON order_events (order_id, created_at);

CREATE TABLE IF NOT EXISTS reviews (
  id            BIGSERIAL PRIMARY KEY,
  product_slug  TEXT NOT NULL,
  order_id      TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  city          TEXT,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body          TEXT NOT NULL,
  hidden        BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id, product_slug)
);
CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews (product_slug, created_at DESC);

CREATE TABLE IF NOT EXISTS subscribers (
  email       TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

/** Opening stock for each size when the store is first set up. Change it any time in /admin/products. */
export const OPENING_STOCK: Record<string, number> = { "500ml": 60, "1l": 50, "5l": 15, "100ml": 40, "250ml": 30 };

export function seedRows() {
  return PRODUCTS.flatMap((p) =>
    p.sizes.map((s) => [`${p.slug}:${s.id}`, p.slug, s.price, s.mrp, OPENING_STOCK[s.id] ?? 25] as const),
  );
}

/** Creates the tables and adds any missing product sizes. Safe to run any number of times. */
export async function applySchema(db: Queryable) {
  await db.query("BEGIN");
  try {
    await db.query("SELECT pg_advisory_xact_lock(724001)"); // one setup at a time
    await db.query(SCHEMA_SQL);
    const rows = seedRows();
    const values = rows
      .map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
      .join(", ");
    await db.query(
      `INSERT INTO variants (id, product_slug, price, mrp, stock) VALUES ${values} ON CONFLICT (id) DO NOTHING`,
      rows.flat(),
    );
    await db.query("COMMIT");
  } catch (e) {
    await db.query("ROLLBACK").catch(() => {});
    throw e;
  }
}
