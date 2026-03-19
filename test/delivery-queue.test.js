import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Tests for the delivery queue database operations.
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to be set.
 */

import {
  enqueueDelivery,
  getPendingDeliveries,
  markDeliveryDone,
  markDeliveryFailed,
  getFailedDeliveries,
} from '../lib/db.js';

test('enqueue and retrieve a pending delivery', async () => {
  const productId = `test_prod_${Date.now()}`;
  const buyerId = `test_buyer_${Date.now()}`;

  await enqueueDelivery(productId, buyerId, 'stars');

  const pending = await getPendingDeliveries(100);
  const found = pending.find(d => d.product_id === productId && d.buyer_telegram_id === buyerId);
  assert.ok(found, 'Delivery should be in pending queue');
  assert.equal(found.status, 'pending');
  assert.equal(found.attempts, 0);
});

test('markDeliveryDone removes from pending', async () => {
  const productId = `test_done_${Date.now()}`;
  const buyerId = `test_buyer_done_${Date.now()}`;

  await enqueueDelivery(productId, buyerId, 'stars');

  const pending = await getPendingDeliveries(100);
  const found = pending.find(d => d.product_id === productId);
  assert.ok(found);

  await markDeliveryDone(found.id);

  const pendingAfter = await getPendingDeliveries(100);
  const gone = pendingAfter.find(d => d.product_id === productId);
  assert.equal(gone, undefined, 'Completed delivery should not be in pending queue');
});

test('markDeliveryFailed increments attempts and sets backoff', async () => {
  const productId = `test_fail_${Date.now()}`;
  const buyerId = `test_buyer_fail_${Date.now()}`;

  await enqueueDelivery(productId, buyerId, 'stars');

  const pending = await getPendingDeliveries(100);
  const found = pending.find(d => d.product_id === productId);
  assert.ok(found);

  await markDeliveryFailed(found.id, 'Bot API timeout');

  // After 1 failure, should still be pending but with future retry time
  // (won't appear in getPendingDeliveries until next_retry_at passes)
  const failed = await getFailedDeliveries(100);
  const inFailed = failed.find(d => d.product_id === productId);
  // With 1 attempt out of 3 max, should NOT be in failed yet
  assert.equal(inFailed, undefined, 'Should not be permanently failed after 1 attempt');
});

test('delivery becomes permanently failed after max attempts', async () => {
  const productId = `test_permafail_${Date.now()}`;
  const buyerId = `test_buyer_pf_${Date.now()}`;

  await enqueueDelivery(productId, buyerId, 'stars');

  const pending = await getPendingDeliveries(100);
  const found = pending.find(d => d.product_id === productId);
  assert.ok(found);

  // Exhaust all 3 attempts
  await markDeliveryFailed(found.id, 'Attempt 1 fail');
  await markDeliveryFailed(found.id, 'Attempt 2 fail');
  await markDeliveryFailed(found.id, 'Attempt 3 fail');

  const failed = await getFailedDeliveries(100);
  const inFailed = failed.find(d => d.product_id === productId);
  assert.ok(inFailed, 'Should be permanently failed after 3 attempts');
  assert.equal(inFailed.status, 'failed');
  assert.equal(Number(inFailed.attempts), 3);
  assert.equal(inFailed.last_error, 'Attempt 3 fail');
});
