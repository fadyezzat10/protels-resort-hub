import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import fs from "fs";
import path from "path";

// Load .env before anything else so DATABASE_URL is available on VPS
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch (_) {}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const RETRYABLE_MESSAGES = [
  "endpoint has been disabled",
  "endpoint is disabled",
  "connection terminated",
  "connection refused",
  "ECONNRESET",
  "ETIMEDOUT",
];

function isRetryable(err: any): boolean {
  const msg = (err?.message || "").toLowerCase();
  return RETRYABLE_MESSAGES.some((s) => msg.includes(s.toLowerCase()));
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const originalQuery = pool.query.bind(pool);

(pool as any).query = async function (...args: any[]) {
  const maxAttempts = 5;
  let lastErr: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await (originalQuery as any)(...args);
    } catch (err: any) {
      lastErr = err;
      if (isRetryable(err) && attempt < maxAttempts) {
        const delay = attempt * 2000;
        console.warn(
          `[db] retryable error (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms: ${err.message}`
        );
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
} as typeof pool.query;

export const db = drizzle(pool, { schema });
export { pool };
