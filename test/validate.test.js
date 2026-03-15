import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNewCommand, isValidProductId, getForwardedClientIp, sanitizeCreatorProfileInput } from '../lib/validate.js';

test('parseNewCommand accepts valid command', () => {
  const out = parseNewCommand('/new 50 My Title | paid content');
  assert.equal(out.ok, true);
  assert.deepEqual(out.value, { price: 50, title: 'My Title', content: 'paid content' });
});

test('parseNewCommand rejects malformed command', () => {
  const out = parseNewCommand('/new bad command');
  assert.equal(out.ok, false);
  assert.equal(out.error, 'format');
});

test('parseNewCommand rejects invalid price', () => {
  const out = parseNewCommand('/new 0 My Title | paid content');
  assert.equal(out.ok, false);
  assert.equal(out.error, 'price');
});

test('isValidProductId validates UUID-like payloads', () => {
  assert.equal(isValidProductId('550e8400-e29b-41d4-a716-446655440000'), true);
  assert.equal(isValidProductId('not-a-product-id'), false);
  assert.equal(isValidProductId('550e8400-e29b-41d4-a716-446655440000;DROP TABLE'), false);
});


test('getForwardedClientIp returns first valid forwarded IP', () => {
  assert.equal(getForwardedClientIp('203.0.113.7, 10.0.0.1'), '203.0.113.7');
  assert.equal(getForwardedClientIp('   '), null);
});

test('sanitizeCreatorProfileInput validates and normalizes creator profile payload', () => {
  const out = sanitizeCreatorProfileInput({
    legal_name: '  Alice Example  ',
    email: 'ALICE@EXAMPLE.COM ',
    country: 'us',
    payout_method: 'PAYPAL',
    payout_details: ' details ',
  });

  assert.equal(out.ok, true);
  assert.deepEqual(out.value, {
    legal_name: 'Alice Example',
    email: 'alice@example.com',
    country: 'US',
    payout_method: 'paypal',
    payout_details: 'details',
  });

  const bad = sanitizeCreatorProfileInput({ country: 'USA' });
  assert.equal(bad.ok, false);
  assert.equal(bad.error, 'country must be a 2-letter ISO code');
});
