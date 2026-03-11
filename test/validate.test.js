import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNewCommand, isValidProductId } from '../lib/validate.js';

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
