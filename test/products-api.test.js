import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Integration tests for the /api/products endpoint.
 * Tests input validation, auth requirements, and content gating.
 *
 * Requires a running dev server on TEST_PORT (default 4124).
 */

const PORT = process.env.TEST_PORT || 4124;
const BASE = `http://127.0.0.1:${PORT}`;

test('GET /api/products requires creator_id or product_id', async () => {
  const res = await fetch(`${BASE}/api/products`);
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /creator_id or product_id required/);
});

test('GET /api/products rejects invalid product_id format', async () => {
  const res = await fetch(`${BASE}/api/products?product_id=invalid;sql`);
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /Invalid product_id/);
});

test('GET /api/products returns 404 for non-existent product', async () => {
  const res = await fetch(`${BASE}/api/products?product_id=abcdefgh`);
  assert.equal(res.status, 404);
});

test('GET /api/products requires auth for creator_id listing', async () => {
  const res = await fetch(`${BASE}/api/products?creator_id=12345`);
  assert.equal(res.status, 401);
});

test('POST /api/products rejects invalid JSON', async () => {
  const res = await fetch(`${BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: 'not json',
  });
  assert.equal(res.status, 400);
});

test('POST /api/products rejects missing initData', async () => {
  const res = await fetch(`${BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test',
      price_stars: 10,
      content_type: 'text',
      content: 'test content',
    }),
  });
  assert.equal(res.status, 401);
});

test('POST /api/products rejects expired initData', async () => {
  const res = await fetch(`${BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      init_data: 'auth_date=1000000000&hash=0000000000000000000000000000000000000000000000000000000000000000',
      title: 'Test',
      price_stars: 10,
      content_type: 'text',
      content: 'test content',
    }),
  });
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.code, 'INITDATA_EXPIRED');
});

test('DELETE /api/products rejects missing product_id', async () => {
  const res = await fetch(`${BASE}/api/products`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ init_data: 'fake' }),
  });
  assert.equal(res.status, 400);
});

test('PATCH /api/products rejects invalid product_id', async () => {
  const res = await fetch(`${BASE}/api/products`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      init_data: 'fake',
      product_id: 'invalid!',
      title: 'New Title',
    }),
  });
  // Should fail on auth first (401) since init_data is invalid
  assert.equal(res.status, 401);
});
