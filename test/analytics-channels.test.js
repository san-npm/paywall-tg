import test from 'node:test';
import assert from 'node:assert/strict';
import {
  recordEvent,
  getFunnelSummary,
  upsertCreatorChannel,
  deactivateCreatorChannel,
  getCreatorChannels,
} from '../lib/db.js';

/**
 * Requires TURSO_DATABASE_URL (use a local file: URL when running standalone).
 * Events are append-only, so ids are unique per run to keep exact-count
 * assertions correct even when the same DB is reused across runs.
 */

const RUN = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

test('funnel: recordEvent counts and derives conversion', async () => {
  const pid = `evtprod_${RUN}`;
  const creator = `8000_${RUN}`;
  // 4 views, 2 checkout starts, 1 paid, 1 delivered for this product.
  for (let i = 0; i < 4; i++) await recordEvent({ eventType: 'product_view', productId: pid, creatorId: creator, source: 'miniapp' });
  for (let i = 0; i < 2; i++) await recordEvent({ eventType: 'checkout_start', productId: pid, creatorId: creator, source: 'bot' });
  await recordEvent({ eventType: 'payment_success', productId: pid, creatorId: creator, buyerId: '800009', source: 'bot' });
  await recordEvent({ eventType: 'delivered', productId: pid, creatorId: creator, buyerId: '800009', source: 'bot' });

  const s = await getFunnelSummary({ productId: pid });
  assert.equal(s.counts.product_view, 4);
  assert.equal(s.counts.checkout_start, 2);
  assert.equal(s.counts.payment_success, 1);
  assert.equal(s.counts.delivered, 1);
  assert.equal(s.funnel.view_to_checkout_pct, 50);
  assert.equal(s.funnel.checkout_to_paid_pct, 50);
  assert.equal(s.funnel.view_to_paid_pct, 25);
});

test('funnel: recordEvent never throws on a bad payload', async () => {
  await recordEvent(); // no eventType -> no-op, must not throw
  await recordEvent({ eventType: 'broadcast', meta: { chat: 'x' } }); // object meta is serialized
  const s = await getFunnelSummary({});
  assert.ok(s.counts.broadcast >= 1);
});

test('creator_channels: upsert, list, update, deactivate, can_post gating', async () => {
  const creator = `chan_${RUN}`;
  const chanA = `-100${RUN.replace(/[^0-9]/g, '').slice(0, 6) || '123'}1`;
  const chanB = `-100${RUN.replace(/[^0-9]/g, '').slice(0, 6) || '456'}2`;
  await upsertCreatorChannel(creator, chanA, 'My Channel', 'channel', true);
  let chans = await getCreatorChannels(creator);
  assert.equal(chans.length, 1);
  assert.equal(chans[0].chat_title, 'My Channel');

  // Upsert same channel updates title in place (no duplicate row).
  await upsertCreatorChannel(creator, chanA, 'Renamed Channel', 'channel', true);
  chans = await getCreatorChannels(creator);
  assert.equal(chans.length, 1);
  assert.equal(chans[0].chat_title, 'Renamed Channel');

  // A second channel with no post rights is not returned as a broadcast target.
  await upsertCreatorChannel(creator, chanB, 'No Post Rights', 'channel', false);
  chans = await getCreatorChannels(creator);
  assert.equal(chans.length, 1, 'can_post=0 channel is excluded');

  // Deactivation (bot removed/demoted) drops it from the list.
  await deactivateCreatorChannel(creator, chanA);
  chans = await getCreatorChannels(creator);
  assert.equal(chans.length, 0);
});
