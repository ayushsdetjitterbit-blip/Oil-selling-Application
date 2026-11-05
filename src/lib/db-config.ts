import type { PoolConfig } from "pg";

/** The DATABASE_URL from the environment, or null when it is missing or still the .env.example placeholder. */
export function readDatabaseUrl(): string | null {
  const u = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
  if (!u || u.includes("YOUR_PASSWORD")) return null;
  return u;
}

/**
 * Turns a libpq-style URL (the format Neon gives you) into node-postgres options.
 * sslmode and channel_binding are handled here explicitly so the server certificate
 * is always verified and channel_binding=require is honoured.
 */
export function pgConfigFromUrl(raw: string, max = Number(process.env.DB_POOL_MAX ?? 5)): PoolConfig {
  const url = new URL(raw);
  const sslmode = url.searchParams.get("sslmode");
  const channelBinding = url.searchParams.get("channel_binding");
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");
  const isLocal = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
  const useSsl = sslmode ? sslmode !== "disable" : !isLocal;
  return {
    connectionString: url.toString(),
    ssl: useSsl ? { rejectUnauthorized: true } : false,
    enableChannelBinding: useSsl && channelBinding === "require",
    max,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000, // Neon can take a moment to wake an idle compute
  } as PoolConfig;
}
