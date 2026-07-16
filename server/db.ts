import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

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
