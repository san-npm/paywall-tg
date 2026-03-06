/**
 * Simple in-memory rate limiter.
 * Not suitable for multi-instance deployments — use Redis for that.
 */

const buckets = new Map();

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entries] of buckets) {
    const filtered = entries.filter(ts => now - ts < 3600_000);
    if (filtered.length === 0) buckets.delete(key);
    else buckets.set(key, filtered);
  }
}, 600_000);

/**
 * Check if a request should be rate-limited.
 * @param {string} key - Unique key (e.g. "create:12345")
 * @param {number} maxPerHour - Maximum requests per hour
 * @returns {{ limited: boolean, remaining: number }}
 */
export function checkRateLimit(key, maxPerHour) {
  const now = Date.now();
  const windowMs = 3600_000; // 1 hour

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
