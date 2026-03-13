import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { payoutStatementRows, toCsv } from '../lib/payout-statement.js';

const PORT = 4123;
const BASE = `http://127.0.0.1:${PORT}`;
let dev;

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status >= 200) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('Timed out waiting for Next dev server');
}

test('payoutStatementRows appends TOTAL footer row', () => {
  const details = {
    payout: {
      id: 12,
      created_at: '2026-03-13 00:00:00',
      status: 'processing',
      paid_at: null,
      creator_id: '123',
      amount_stars: 95,
      invoice_ref: 'INV-12',
    },
    purchases: [
      { id: 1, product_id: 'p1', product_title: 'A', buyer_telegram_id: 'u1', stars_paid: 50, creator_share: 48, platform_fee: 2, refunded: 0, telegram_charge_id: 'c1', created_at: '2026-03-01' },
      { id: 2, product_id: 'p2', product_title: 'B', buyer_telegram_id: 'u2', stars_paid: 50, creator_share: 47, platform_fee: 3, refunded: 0, telegram_charge_id: 'c2', created_at: '2026-03-02' },
    ],
  };

  const rows = payoutStatementRows(details);
  assert.equal(rows.length, 3);
  const total = rows[rows.length - 1];
  assert.equal(total.purchase_id, 'TOTAL');
  assert.equal(total.stars_paid, 100);
  assert.equal(total.creator_share, 95);
  assert.equal(total.platform_fee, 5);

  const csv = toCsv(rows);
  assert.match(csv, /TOTAL/);
  assert.match(csv, /100/);
});

test('start next dev for endpoint smoke tests', { timeout: 60000 }, async () => {
  dev = spawn('npm', ['run', 'dev', '--', '-p', String(PORT)], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderr = '';
  dev.stderr.on('data', (d) => { stderr += d.toString(); });

  try {
    await waitForServer(`${BASE}/`);
  } catch (err) {
    throw new Error(`${err.message}\n${stderr}`);
  }
});

test('admin payout statement endpoint stays closed to non-admin', { timeout: 30000 }, async () => {
  const res = await fetch(`${BASE}/api/admin?kind=payout_statement_csv&payout_id=1`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.is_admin, false);
});

test('creator payout statement endpoint requires auth', { timeout: 30000 }, async () => {
  const res = await fetch(`${BASE}/api/creator-payout-statement?payout_id=1`);
  assert.equal(res.status, 401);
});

test('stop next dev', async () => {
  if (!dev) return;
  dev.kill('SIGTERM');
  await new Promise((resolve) => {
    const t = setTimeout(resolve, 3000);
    dev.on('exit', () => {
      clearTimeout(t);
      resolve();
    });
  });
});
