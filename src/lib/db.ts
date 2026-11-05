import "server-only";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { pgConfigFromUrl, readDatabaseUrl } from "./db-config";
import { applySchema } from "./schema";

export class DbNotConfiguredError extends Error {
  constructor() {
    super("The store database is not connected yet. Run `npm run setup` (or put DATABASE_URL in .env) and restart the server.");
  }
}

export const dbConfigured = () => readDatabaseUrl() !== null;

type G = typeof globalThis & { __noPool?: Pool; __noSchema?: Promise<void> };
const g = globalThis as G; // survives hot reloads in dev

function pool(): Pool {
  const url = readDatabaseUrl();
  if (!url) throw new DbNotConfiguredError();
  if (!g.__noPool) {
    g.__noPool = new Pool(pgConfigFromUrl(url));
    // Neon closes idle connections when its compute sleeps; that must not crash the server.
    g.__noPool.on("error", (e) => console.error("[db] idle connection closed:", e.message));
  }
  return g.__noPool;
}

/** Creates tables on first use, once per server process. */
function ready(): Promise<void> {
  g.__noSchema ??= (async () => {
    const c = await pool().connect();
    try {
      await applySchema(c);
    } finally {
      c.release();
    }
  })().catch((e) => {
    g.__noSchema = undefined;
    throw e;
  });
  return g.__noSchema;
}

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  await ready();
  return (await pool().query<T>(text, params)).rows;
}

export async function transaction<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  await ready();
  const c = await pool().connect();
  try {
    await c.query("BEGIN");
    const out = await fn(c);
    await c.query("COMMIT");
    return out;
  } catch (e) {
    await c.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}
