"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { computeTotals, MAX_QTY, type CartLine } from "./pricing";

type CartState = {
  items: CartLine[];
  ready: boolean;
  coupon: string;
  count: number;
  add: (variantId: string, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setCoupon: (c: string) => void;
};

const Ctx = createContext<CartState | null>(null);
const KEY = "natural-oil-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [coupon, setCouponState] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.items)) setItems(d.items);
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

  const add = useCallback((id: string, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.variantId === id);
      if (found) return cur.map((i) => (i.variantId === id ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i));
      return [...cur, { variantId: id, qty: Math.min(MAX_QTY, qty) }];
    });
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setItems((cur) =>
      qty < 1 ? cur.filter((i) => i.variantId !== id) : cur.map((i) => (i.variantId === id ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)),
    );
  }, []);
  const remove = useCallback((id: string) => setItems((cur) => cur.filter((i) => i.variantId !== id)), []);
  const clear = useCallback(() => {
    setItems([]);
    setCouponState("");
  }, []);

  const value = useMemo<CartState>(
    () => ({
      items,
      ready,
      coupon,
      count: items.reduce((s, i) => s + i.qty, 0),
      add,
      setQty,
      remove,
      clear,
      setCoupon: setCouponState,
    }),
    [items, ready, coupon, add, setQty, remove, clear],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}

export function useCartTotals() {
  const { items, coupon } = useCart();
  return useMemo(() => computeTotals(items, coupon), [items, coupon]);
}
