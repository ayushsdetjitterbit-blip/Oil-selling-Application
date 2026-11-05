"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { computeTotals, stockProblems, type CartLine } from "./pricing";
import { findVariant, MAX_QTY, maxQty, type Product } from "./products";

type CartState = {
  /** Live catalogue (prices + stock from the database) sent down by the server. */
  catalog: Product[];
  /** False when the database isn't connected: the shop can be browsed but not bought from. */
  live: boolean;
  /** Why the database isn't connected (development only). */
  dbProblem: string | null;
  items: CartLine[];
  ready: boolean;
  coupon: string;
  count: number;
  add: (variantId: string, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setCoupon: (c: string) => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  lastAdded: { variantId: string; at: number } | null;
};

const Ctx = createContext<CartState | null>(null);
const KEY = "natural-oil-cart-v1";

export function CartProvider({ children, catalog, live, dbProblem = null }: { children: React.ReactNode; catalog: Product[]; live: boolean; dbProblem?: string | null }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [coupon, setCouponState] = useState("");
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<{ variantId: string; at: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.items)) setItems(d.items.filter((i: CartLine) => typeof i?.variantId === "string" && i.qty > 0));
        if (typeof d.coupon === "string") setCouponState(d.coupon);
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ items, coupon }));
    } catch {}
  }, [items, coupon, ready]);

  /** Most a customer can put in the cart: 20, or what's in stock if less. */
  const limit = useCallback((id: string) => {
    const v = findVariant(id, catalog);
    return v ? maxQty(v.size) : MAX_QTY;
  }, [catalog]);

  const add = useCallback((id: string, qty = 1) => {
    if (limit(id) < 1) return;
    setLastAdded({ variantId: id, at: Date.now() });
    setDrawerOpen(true);
    setItems((cur) => {
      const found = cur.find((i) => i.variantId === id);
      if (found) return cur.map((i) => (i.variantId === id ? { ...i, qty: Math.min(limit(id), i.qty + qty) } : i));
      return [...cur, { variantId: id, qty: Math.min(limit(id), qty) }];
    });
  }, [limit]);
  const setQty = useCallback((id: string, qty: number) => {
    setItems((cur) =>
      qty < 1 ? cur.filter((i) => i.variantId !== id) : cur.map((i) => (i.variantId === id ? { ...i, qty: Math.min(Math.max(limit(id), 1), qty) } : i)),
    );
  }, [limit]);
  const remove = useCallback((id: string) => setItems((cur) => cur.filter((i) => i.variantId !== id)), []);
  const clear = useCallback(() => {
    setItems([]);
    setCouponState("");
  }, []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartState>(
    () => ({
      catalog,
      live,
      dbProblem,
      items,
      ready,
      coupon,
      count: items.reduce((s, i) => s + i.qty, 0),
      add,
      setQty,
      remove,
      clear,
      setCoupon: setCouponState,
      drawerOpen,
      openDrawer,
      closeDrawer,
      lastAdded,
    }),
    [catalog, live, dbProblem, items, ready, coupon, add, setQty, remove, clear, drawerOpen, openDrawer, closeDrawer, lastAdded],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}

export function useCartTotals() {
  const { items, coupon, catalog } = useCart();
  return useMemo(() => computeTotals(items, coupon, catalog), [items, coupon, catalog]);
}

export function useStockProblems() {
  const { items, catalog } = useCart();
  return useMemo(() => stockProblems(items, catalog), [items, catalog]);
}
