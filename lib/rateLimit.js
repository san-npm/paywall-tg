/**
 * Simple in-memory sliding-window rate limiter.
 * Cleanup happens inline on each check (no setInterval — serverless-safe).
 * Not suitable for multi-instance deployments — use Redis for that.
 */

const buckets = new Map();
let lastCleanup = Date.now();

/**
 * Check if a request should be rate-limited.
 * @param {string} key - Unique key (e.g. "create:12345")
 * @param {number} maxPerHour - Maximum requests per hour
 * @returns {{ limited: boolean, remaining: number }}
 */
export function checkRateLimit(key, maxPerHour) {
  const now = Date.now();
  const windowMs = 3600_000; // 1 hour

  // Lazy cleanup every 10 minutes (serverless-safe, no setInterval)
  if (now - lastCleanup > 600_000) {
    lastCleanup = now;
    for (const [k, v] of buckets) {
      const filtered = v.filter(ts => now - ts < windowMs);
      if (filtered.length === 0) buckets.delete(k);
      else buckets.set(k, filtered);
    }
  }

  let entries = buckets.get(key) || [];
  entries = entries.filter(ts => now - ts < windowMs);

  if (entries.length >= maxPerHour) {
    buckets.set(key, entries);
    return { limited: true, remaining: 0 };
  }

  entries.push(now);
  buckets.set(key, entries);
  return { limited: false, remaining: maxPerHour - entries.length };
}
