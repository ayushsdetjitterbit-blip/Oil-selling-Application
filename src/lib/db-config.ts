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

export const NOT_CONFIGURED_MESSAGE =
  "There is no DATABASE_URL in the .env file (or it still says YOUR_PASSWORD). In the project folder run `npm run setup`, paste your Neon connection string, then restart `npm run dev`.";

/** Turns a database error into a plain-English reason plus what to do about it. */
export function explainDbError(e: unknown): string {
  const err = e as { code?: string; message?: string } | null;
  const msg = err?.message ?? String(e);
  const code = err?.code ?? "";
  if (/password authentication failed/i.test(msg))
    return "The password in DATABASE_URL is wrong. In Neon open Connect, turn on Show password, Copy snippet, then run `npm run setup` again and paste it.";
  if (code === "ENOTFOUND" || code === "EAI_AGAIN" || /getaddrinfo/i.test(msg))
    return "The database address in DATABASE_URL can't be found. Check your internet connection, or copy the connection string from Neon again.";
  if (code === "ECONNREFUSED") return "The database refused the connection. Check the host and port in DATABASE_URL.";
  if (/timeout|ETIMEDOUT|ECONNRESET|terminated unexpectedly/i.test(`${code} ${msg}`))
    return "Couldn't reach the database in time. Some office or college Wi-Fi networks block database connections (port 5432), so try another network or a phone hotspot. A sleeping Neon database can also take a few seconds to wake up: reload the page.";
  if (/database ".*" does not exist/i.test(msg)) return "The database name at the end of DATABASE_URL doesn't exist. Copy the connection string from Neon again.";
  if (/role ".*" does not exist/i.test(msg)) return "The user name in DATABASE_URL doesn't exist in Neon. Copy the connection string from Neon again.";
  if (/channel binding|SASL/i.test(msg)) return `The secure login handshake failed (${msg}). Try deleting "&channel_binding=require" from DATABASE_URL in .env, then restart.`;
  if (/certificate|self.signed|SSL|TLS/i.test(msg)) return `The secure connection failed (${msg}). Make sure DATABASE_URL ends with ?sslmode=require.`;
  if (/Invalid URL/i.test(msg)) return "DATABASE_URL in .env isn't a valid connection string. Run `npm run setup` and paste the snippet from Neon.";
  return msg;
}
