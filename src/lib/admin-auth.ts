import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "no_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

/** Why the admin panel can't be used yet, or null when ADMIN_PASSWORD is good. */
export function adminPasswordProblem(): string | null {
  const p = process.env.ADMIN_PASSWORD ?? "";
  if (!p) return "ADMIN_PASSWORD is not set in .env. Run `npm run setup` to create one, then restart the server.";
  if (p.length < 8 || p === "change-me") return "ADMIN_PASSWORD in .env is too weak. Use at least 8 characters (or run `npm run setup`), then restart the server.";
  return null;
}

// The signing key comes from the password, so changing ADMIN_PASSWORD logs everyone out.
const key = () => createHash("sha256").update("natural-oil-admin:" + (process.env.ADMIN_PASSWORD ?? "")).digest();
const sign = (exp: number) => createHmac("sha256", key()).update(String(exp)).digest("base64url");
const sha = (s: string) => createHash("sha256").update(s).digest();

export function passwordMatches(input: string) {
  return timingSafeEqual(sha(input), sha(process.env.ADMIN_PASSWORD ?? ""));
}

const g = globalThis as typeof globalThis & { __noLogin?: Map<string, { n: number; reset: number }> };
const attempts = (g.__noLogin ??= new Map());

/** Allows 8 login attempts per 10 minutes from one address. */
export async function loginAllowed() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || a.reset < now) {
    attempts.set(ip, { n: 1, reset: now + 10 * 60_000 });
    return true;
  }
  a.n += 1;
  return a.n <= 8;
}

export async function startSession() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const host = (await headers()).get("host") ?? "";
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !local,
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (adminPasswordProblem()) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [expS, sig] = v.split(".");
  const exp = Number(expS);
  if (!exp || exp < Date.now() / 1000 || !sig) return false;
  const good = Buffer.from(sign(exp));
  const given = Buffer.from(sig);
  return good.length === given.length && timingSafeEqual(good, given);
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
