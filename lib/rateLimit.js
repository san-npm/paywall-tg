/**
 * DB-backed sliding-window rate limiter (Turso/libSQL).
 * Multi-instance safe and serverless-friendly.
 */

import { createClient } from '@libsql/client';

let client;
let initialized = false;

function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

async function ensureTable() {
  if (initialized) return;
  await getClient().execute(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      k TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    )
  `);
  initialized = true;
}

/**
 * Check if a request should be rate-limited.
 * @param {string} key - Unique key (e.g. "create:12345")
 * @param {number} maxPerHour - Maximum requests per hour
 * @returns {Promise<{ limited: boolean, remaining: number }>} 
 */
export async function checkRateLimit(key, maxPerHour) {
  await ensureTable();

  const now = Date.now();
  const windowMs = 3600_000;
  const nextReset = now + windowMs;

  // Atomic upsert with rolling-window reset logic.
  const result = await getClient().execute({
    sql: `
      INSERT INTO rate_limits (k, count, reset_at)
      VALUES (?, 1, ?)
      ON CONFLICT(k) DO UPDATE SET
        count = CASE WHEN rate_limits.reset_at <= ? THEN 1 ELSE rate_limits.count + 1 END,
        reset_at = CASE WHEN rate_limits.reset_at <= ? THEN ? ELSE rate_limits.reset_at END
      RETURNING count, reset_at
    `,
    args: [key, nextReset, now, now, nextReset],
  });

  const row = result.rows[0];
  const count = Number(row?.count || 1);
  const limited = count > maxPerHour;
  const remaining = Math.max(0, maxPerHour - count);

  // Opportunistic cleanup of expired rows (best-effort).
  if (Math.random() < 0.02) {
    getClient().execute({ sql: 'DELETE FROM rate_limits WHERE reset_at <= ?', args: [now] }).catch(() => {});
  }

  return { limited, remaining };
}
