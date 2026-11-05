"use client";
import { useRef } from "react";
import { Bottle } from "./bottle";

/** Hero bottles that tilt and drift with the pointer. */
export function HeroBottles() {
  const ref = useRef<HTMLDivElement>(null);
  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", String((e.clientX - r.left) / r.width - 0.5));
    el.style.setProperty("--my", String((e.clientY - r.top) / r.height - 0.5));
  }
  const layer = (depth: number) => ({ transform: `translate(calc(var(--mx,0) * ${depth}px), calc(var(--my,0) * ${depth}px))`, transition: "transform .25s ease-out" });
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={() => { ref.current?.style.setProperty("--mx", "0"); ref.current?.style.setProperty("--my", "0"); }}
      className="relative mx-auto flex h-[22rem] w-full max-w-md items-end justify-center md:h-[30rem]">
      <div className="absolute inset-x-6 bottom-4 top-10 rounded-full bg-gold/30 blur-3xl" style={layer(-20)} />
      <div className="absolute bottom-2 left-0" style={layer(30)}><Bottle color="#C98A1C" label="SESAME" className="float h-52 md:h-64" /></div>
      <div className="relative z-10" style={layer(14)}><Bottle color="#D9A21B" label="GROUNDNUT" className="float h-72 md:h-[26rem]" /></div>
      <div className="absolute bottom-2 right-0" style={layer(40)}><Bottle color="#EFE3B0" label="COCONUT" className="float h-52 md:h-64" /></div>
      {[["12%", "18%", 0], ["80%", "12%", 1.2], ["70%", "60%", 2.4], ["20%", "55%", 3.1]].map(([l, t, d], i) => (
        <span key={i} className="drop absolute h-3 w-2.5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gold/80" style={{ left: l as string, top: t as string, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}
