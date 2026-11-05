"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BagIcon, XIcon } from "./icons";

type Item = { city: string; product: string; at: string };
const HIDE_ON = ["/checkout", "/payment", "/order"];
const MAX_SHOWN = 4;

function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}
const titleCase = (s: string) => s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());

/** "Someone in Chennai bought Sesame Oil": real recent orders only (city + product, never names). */
export function LiveActivity() {
  const path = usePathname();
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [off, setOff] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("no-activity-off")) return setOff(true);
    } catch {}
    const t = setTimeout(async () => {
      try {
        const r = await fetch("/api/activity");
        if (r.ok) setItems(await r.json());
      } catch {}
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (off || items.length === 0) return;
    let shown = 0;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const show = () => {
      setIndex(shown % items.length);
      setVisible(true);
      hide = setTimeout(() => setVisible(false), 6000);
      shown++;
    };
    show();
    const every = setInterval(() => (shown >= Math.min(items.length, MAX_SHOWN) ? clearInterval(every) : show()), 20000);
    return () => {
      clearInterval(every);
      if (hide) clearTimeout(hide);
    };
  }, [items, off]);

  if (off || index < 0 || HIDE_ON.some((p) => path.startsWith(p))) return null;
  const it = items[index];
  return (
    <div role="status" aria-live="polite"
      className={`fixed bottom-4 left-4 z-30 max-w-[calc(100vw-2rem)] transition-all duration-500 sm:max-w-sm ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
      <div className="relative flex items-center gap-3 rounded-2xl border border-sand bg-paper p-3 pr-10 shadow-[0_18px_40px_-18px_rgba(59,42,23,.5)]">
        <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold/30 to-leaf/20 text-leaf-dark"><BagIcon className="h-5 w-5" /></span>
        <p className="text-sm leading-snug">
          Someone in <b>{titleCase(it.city)}</b> bought <b>{it.product}</b>
          <span className="mt-0.5 block text-xs text-bark/55">{ago(it.at)} · real order</span>
        </p>
        <button aria-label="Hide purchase notices" className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-xs text-bark/50 hover:bg-sand"
          onClick={() => {
            setOff(true);
            try { sessionStorage.setItem("no-activity-off", "1"); } catch {}
          }}><XIcon className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}
