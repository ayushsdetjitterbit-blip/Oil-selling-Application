import "server-only";

type Entry = { at: number; value: Promise<unknown> };
const g = globalThis as typeof globalThis & { __noCache?: Map<string, Entry> };
const store = (g.__noCache ??= new Map());

/** Tiny in-memory TTL cache so storefront pages don't query the database on every request. */
export function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as Promise<T>;
  const value = fn();
  store.set(key, { at: Date.now(), value });
  value.catch(() => store.delete(key));
  return value;
}

export function invalidate(...prefixes: string[]) {
  for (const k of [...store.keys()]) if (prefixes.some((p) => k.startsWith(p))) store.delete(k);
}
