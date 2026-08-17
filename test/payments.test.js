import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePlatformFee, isProductReady } from '../lib/payments.js';

test('platform fee never exceeds the advertised five percent', () => {
  for (let stars = 20; stars <= 10_000; stars += 1) {
    const fee = calculatePlatformFee(stars);
    assert.equal(Number.isInteger(fee), true);
    assert.ok(fee >= 0);
    assert.ok(fee <= stars * 0.05, `${stars} Stars produced a fee above 5%`);
  }
});

test('platform fee rounds down to whole Stars', () => {
  assert.equal(calculatePlatformFee(20), 1);
  assert.equal(calculatePlatformFee(39), 1);
  assert.equal(calculatePlatformFee(40), 2);
  assert.equal(calculatePlatformFee(99), 4);
  assert.equal(calculatePlatformFee(100), 5);
});

test('file offers remain drafts until a Telegram file id exists', () => {
  assert.equal(isProductReady({ content_type: 'file', file_id: null }), false);
  assert.equal(isProductReady({ content_type: 'file', file_id: '   ' }), false);
  assert.equal(isProductReady({ content_type: 'file', file_id: 'telegram-file-id' }), true);
  assert.equal(isProductReady({ content_type: 'text', content: 'ready' }), true);
});
