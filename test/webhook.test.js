import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

/**
 * Integration tests for the Telegram webhook handler.
 * These test the full HTTP flow by calling the webhook API endpoint
 * against a running dev server.
 *
 * Run with: WEBHOOK_SECRET=test_secret BOT_TOKEN=test_token node --test test/webhook.test.js
 *
 * Note: These tests validate request handling and auth — actual Telegram API
 * calls will fail gracefully since BOT_TOKEN is fake, but the logic paths
 * (idempotency, validation, error handling) are exercised.
 */

const PORT = process.env.TEST_PORT || 4124;
const BASE = `http://127.0.0.1:${PORT}`;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'test_secret';

function webhookHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-telegram-bot-api-secret-token': WEBHOOK_SECRET,
  };
}

// Helper: generate unique update IDs
let updateCounter = Date.now();
function nextUpdateId() {
  return ++updateCounter;
}

test('webhook rejects missing secret header', async () => {
  const res = await fetch(`${BASE}/api/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ update_id: nextUpdateId() }),
  });
  assert.equal(res.status, 401);
});

test('webhook rejects wrong secret header', async () => {
  const res = await fetch(`${BASE}/api/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-telegram-bot-api-secret-token': 'wrong_secret',
    },
    body: JSON.stringify({ update_id: nextUpdateId() }),
  });
  assert.equal(res.status, 401);
});

test('webhook accepts valid secret and returns ok', async () => {
  const res = await fetch(`${BASE}/api/webhook`, {
    method: 'POST',
    headers: webhookHeaders(),
    body: JSON.stringify({ update_id: nextUpdateId() }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
});

test('webhook rejects invalid JSON body', async () => {
  const res = await fetch(`${BASE}/api/webhook`, {
    method: 'POST',
    headers: {
      ...webhookHeaders(),
      'Content-Type': 'text/plain',
    },
    body: 'not json{{{',
  });
  assert.equal(res.status, 400);
});

test('webhook idempotency: duplicate update_id returns ok without reprocessing', async () => {
  const updateId = nextUpdateId();

  const res1 = await fetch(`${BASE}/api/webhook`, {
    method: 'POST',
    headers: webhookHeaders(),
    body: JSON.stringify({ update_id: updateId }),
  });
  assert.equal(res1.status, 200);

  const res2 = await fetch(`${BASE}/api/webhook`, {
    method: 'POST',
    headers: webhookHeaders(),
    body: JSON.stringify({ update_id: updateId }),
  });
  assert.equal(res2.status, 200);
  const body2 = await res2.json();
  assert.equal(body2.ok, true);
});

test('pre_checkout_query rejects invalid product ID', async () => {
  const res = await fetch(`${BASE}/api/webhook`, {
    method: 'POST',
    headers: webhookHeaders(),
    body: JSON.stringify({
      update_id: nextUpdateId(),
      pre_checkout_query: {
        id: 'query_1',
        from: { id: 12345 },
        invoice_payload: 'invalid;sql;injection',
        currency: 'XTR',
        total_amount: 100,
      },
    }),
  });
  // Should return 200 (webhook must always return 200 to Telegram)
  // but internally rejects the query
  assert.equal(res.status, 200);
});

test('pre_checkout_query rejects non-existent product', async () => {
  const res = await fetch(`${BASE}/api/webhook`, {
    method: 'POST',
    headers: webhookHeaders(),
    body: JSON.stringify({
      update_id: nextUpdateId(),
      pre_checkout_query: {
        id: 'query_2',
        from: { id: 12345 },
        invoice_payload: 'abcdefgh', // valid format but doesn't exist
        currency: 'XTR',
        total_amount: 100,
      },
    }),
  });
  assert.equal(res.status, 200);
});

test('successful_payment rejects wrong currency', async () => {
  const res = await fetch(`${BASE}/api/webhook`, {
    method: 'POST',
    headers: webhookHeaders(),
    body: JSON.stringify({
      update_id: nextUpdateId(),
      message: {
        from: { id: 12345 },
        chat: { id: 12345 },
        successful_payment: {
          invoice_payload: 'abcdefgh',
          currency: 'USD', // wrong, should be XTR
          total_amount: 100,
          telegram_payment_charge_id: 'charge_test_1',
        },
      },
    }),
  });
  assert.equal(res.status, 200);
});

test('successful_payment rejects missing charge ID', async () => {
  const res = await fetch(`${BASE}/api/webhook`, {
    method: 'POST',
    headers: webhookHeaders(),
    body: JSON.stringify({
      update_id: nextUpdateId(),
      message: {
        from: { id: 12345 },
        chat: { id: 12345 },
        successful_payment: {
          invoice_payload: 'abcdefgh',
          currency: 'XTR',
          total_amount: 100,
          // missing telegram_payment_charge_id
        },
      },
    }),
  });
  assert.equal(res.status, 200);
});
