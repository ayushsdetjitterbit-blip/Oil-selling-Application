/**
 * One-time setup:  npm run setup
 *  1. Creates .env (kept on your computer only; it is in .gitignore)
 *  2. Asks for your Neon connection string if it isn't there yet
 *  3. Creates an admin password if there isn't a strong one
 *  4. Connects to the database, creates the tables and stocks every product size
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { Client } from "pg";
import { pgConfigFromUrl } from "../src/lib/db-config";
import { applySchema } from "../src/lib/schema";

const ENV_FILE = ".env";

function getVar(text: string, key: string) {
  const m = text.match(new RegExp(`^${key}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["'](.*)["']$/, "$1") : undefined;
}

function setVar(text: string, key: string, value: string) {
  const line = `${key}="${value}"`;
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(text)) return text.replace(re, () => line);
  return (text && !text.endsWith("\n") ? text + "\n" : text) + line + "\n";
}

const usable = (url?: string) => !!url && /^postgres(ql)?:\/\//.test(url) && !url.includes("YOUR_PASSWORD");

async function main() {
  let env = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : existsSync(".env.example") ? readFileSync(".env.example", "utf8") : "";

  let url = getVar(env, "DATABASE_URL");
  if (!usable(url)) {
    console.log("\nConnect your Neon database:");
    console.log("  In Neon, open your project → Connect → turn on 'Show password' → Copy snippet.");
    const rl = createInterface({ input: stdin, output: stdout });
    const pasted = await rl.question("  Paste it here: ");
    rl.close();
    url = pasted.match(/postgres(?:ql)?:\/\/[^\s'"]+/)?.[0];
    if (!usable(url)) throw new Error("That doesn't look like a Postgres connection string (it should start with postgresql://).");
    env = setVar(env, "DATABASE_URL", url!);
  }

  let adminPassword = getVar(env, "ADMIN_PASSWORD");
  let generated = false;
  if (!adminPassword || adminPassword === "change-me" || adminPassword.length < 8) {
    adminPassword = randomBytes(9).toString("base64url");
    env = setVar(env, "ADMIN_PASSWORD", adminPassword);
    generated = true;
  }
  writeFileSync(ENV_FILE, env);
  console.log("\n✓ Saved .env (it stays on this computer and is never pushed to GitHub)");

  const host = new URL(url!).hostname;
  console.log(`… Connecting to ${host}`);
  const client = new Client(pgConfigFromUrl(url!, 1));
  await client.connect();
  try {
    await applySchema(client);
    const { rows } = await client.query("SELECT COUNT(*)::int AS sizes, COALESCE(SUM(stock), 0)::int AS units FROM variants");
    console.log(`✓ Database ready: tables created, ${rows[0].sizes} product sizes with ${rows[0].units} bottles in stock`);
  } finally {
    await client.end();
  }

  console.log(generated ? `✓ Admin password created: ${adminPassword}   (save it; it is also in .env)` : "✓ Admin password: the ADMIN_PASSWORD already in .env");
  console.log("\nNext:  npm run dev   →   shop: http://localhost:3002   admin: http://localhost:3002/admin\n");
}

main().catch((e) => {
  console.error("\n✗ Setup failed:", e instanceof Error ? e.message : e);
  if (String(e?.message ?? "").includes("password authentication failed")) {
    console.error("  The password in the connection string is wrong. Copy the snippet from Neon again with 'Show password' on.");
  }
  process.exit(1);
});
