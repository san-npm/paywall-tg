import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Tests for the DB-backed sliding-window rate limiter.
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to be set.
 */

import { checkRateLimit } from '../lib/rateLimit.js';

test('rate limiter allows requests under limit', async () => {
  const key = `test_allow_${Date.now()}`;
  const result = await checkRateLimit(key, 5);
  assert.equal(result.limited, false);
  assert.equal(result.remaining, 4);
});

test('rate limiter blocks requests over limit', async () => {
  const key = `test_block_${Date.now()}`;
  const limit = 3;

  // Use up the limit
  for (let i = 0; i < limit; i++) {
    const r = await checkRateLimit(key, limit);
    assert.equal(r.limited, false, `Request ${i + 1} should be allowed`);
  }

  // Next request should be blocked
  const blocked = await checkRateLimit(key, limit);
  assert.equal(blocked.limited, true);
  assert.equal(blocked.remaining, 0);
});

test('rate limiter tracks remaining count correctly', async () => {
  const key = `test_remaining_${Date.now()}`;
  const limit = 5;

  const r1 = await checkRateLimit(key, limit);
  assert.equal(r1.remaining, 4);

  const r2 = await checkRateLimit(key, limit);
  assert.equal(r2.remaining, 3);

  const r3 = await checkRateLimit(key, limit);
  assert.equal(r3.remaining, 2);
});

test('different keys are independent', async () => {
  const keyA = `test_indep_a_${Date.now()}`;
  const keyB = `test_indep_b_${Date.now()}`;

  await checkRateLimit(keyA, 2);
  await checkRateLimit(keyA, 2);
  const blockedA = await checkRateLimit(keyA, 2);
  assert.equal(blockedA.limited, true);

  // Key B should still be fine
  const allowedB = await checkRateLimit(keyB, 2);
  assert.equal(allowedB.limited, false);
});
