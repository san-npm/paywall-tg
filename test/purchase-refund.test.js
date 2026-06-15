import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getOrCreateCreator,
  createProduct,
  getProductRaw,
  recordPurchase,
  reactivatePurchase,
  markPurchaseRefunded,
  hasPurchased,
  recordFiatPurchase,
  markFiatPurchaseRefundedByPaymentIntent,
} from '../lib/db.js';

/**
 * Regression tests for the two HIGH payment-flow fixes from the 2026-06 audit:
 *  - pay-2: a refunded Stars purchase must be re-buyable (reactivatePurchase),
 *           instead of the second charge silently failing on UNIQUE(product,buyer).
 *  - pay-1: a Stripe refund/chargeback must revoke access + reverse the sale
 *           (markFiatPurchaseRefundedByPaymentIntent).
 *
 * Requires TURSO_DATABASE_URL (use a local file: URL when running standalone).
 */

const CREATOR = '900001';
const BUYER = '900002';

test('pay-2: refunded Stars purchase can be re-bought via reactivatePurchase', async () => {
  await getOrCreateCreator(CREATOR, 'creator', 'Creator');
  const pid = 'rebuy23a';
  await createProduct(pid, CREATOR, 'Re-buy product', '', 100, 'text', 'secret-body', null);

  // First purchase
  await recordPurchase(pid, BUYER, 100, 95, 5, 'charge_A');
  assert.equal(await hasPurchased(pid, BUYER), true);
  assert.equal(Number((await getProductRaw(pid)).sales_count), 1);

  // Refund
  assert.equal(await markPurchaseRefunded(pid, BUYER), true);
  assert.equal(await hasPurchased(pid, BUYER), false, 'refund revokes access');
  assert.equal(Number((await getProductRaw(pid)).sales_count), 0);

  // Re-buy: a fresh INSERT would throw UNIQUE(product_id,buyer); reactivate instead.
  let threw = false;
  try {
    await recordPurchase(pid, BUYER, 100, 95, 5, 'charge_B');
  } catch (err) {
    threw = err?.message?.includes('UNIQUE constraint');
    assert.ok(threw, 'expected the UNIQUE-constraint path for a refunded re-buy');
    const reactivated = await reactivatePurchase(pid, BUYER, 100, 95, 5, 'charge_B');
    assert.equal(reactivated, true, 'reactivatePurchase must restore the refunded row');
  }
  assert.equal(threw, true, 'second insert should hit the UNIQUE path that reactivation handles');
  assert.equal(await hasPurchased(pid, BUYER), true, 're-buyer regains access');
  assert.equal(Number((await getProductRaw(pid)).sales_count), 1, 'sales_count restored');
});

test('pay-1: Stripe refund/chargeback revokes access and reverses the sale', async () => {
  await getOrCreateCreator(CREATOR, 'creator', 'Creator');
  const pid = 'fiatref2';
  await createProduct(pid, CREATOR, 'Fiat product', '', 100, 'text', 'secret-body', null, 'document', 500, 500, 'stars,stripe');

  const buyer = '900003';
  await recordFiatPurchase(pid, buyer, 500, 'USD', 475, 25, 'cs_test_1', 'pi_test_1');
  assert.equal(await hasPurchased(pid, buyer), true);
  assert.equal(Number((await getProductRaw(pid)).sales_count), 1);

  // Refund event arrives keyed by payment_intent
  const reversed = await markFiatPurchaseRefundedByPaymentIntent('pi_test_1');
  assert.ok(reversed && reversed.product_id === pid, 'returns the reversed product id');
  assert.equal(await hasPurchased(pid, buyer), false, 'refund revokes content access');
  assert.equal(Number((await getProductRaw(pid)).sales_count), 0, 'sale removed from counter');

  // Idempotent: a duplicate refund event is a no-op
  const again = await markFiatPurchaseRefundedByPaymentIntent('pi_test_1');
  assert.equal(again, null, 'second refund event reverses nothing');
});
