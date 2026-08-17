import test from 'node:test';
import assert from 'node:assert/strict';
import {
  acceptBuyerTerms,
  acceptCreatorTerms,
  attachFileToProduct,
  createPayoutsFromUnassigned,
  createProduct,
  getClient,
  getCreatorFinancialSummary,
  getOrCreateCreator,
  getPayoutDetails,
  getProduct,
  getProductRaw,
  markPayoutPaid,
  markPurchaseRefunded,
  recordPurchase,
  setProductActive,
  updateProduct,
  hasAcceptedCurrentBuyerTerms,
  hasAcceptedCurrentCreatorTerms,
} from '../lib/db.js';
import { PAYOUT_EUR_PER_STAR, PAYOUT_HOLD_DAYS } from '../lib/config.js';

const creator = `policy_creator_${process.pid}`;

test('buyer terms acceptance is versioned and auditable', async () => {
  const buyer = `terms_buyer_${process.pid}`;
  assert.equal(await hasAcceptedCurrentBuyerTerms(buyer), false);
  const acceptance = await acceptBuyerTerms(buyer, '127.0.0.1', 'test-agent', 'test');
  assert.equal(acceptance.source, 'test');
  assert.ok(acceptance.accepted_at);
  assert.equal(await hasAcceptedCurrentBuyerTerms(buyer), true);

  await getClient().execute({
    sql: `INSERT INTO buyer_terms_acceptance (buyer_id, terms_version, source)
          VALUES (?, 'legacy-v1', 'test')`,
    args: [buyer],
  });
  await acceptBuyerTerms(buyer, '127.0.0.2', 'test-agent-2', 'repeat');
  const versions = await getClient().execute({
    sql: 'SELECT terms_version, source FROM buyer_terms_acceptance WHERE buyer_id = ? ORDER BY terms_version',
    args: [buyer],
  });
  assert.equal(versions.rows.length, 2, 'each terms version is retained exactly once');
  assert.equal(versions.rows.find((row) => row.terms_version !== 'legacy-v1').source, 'test', 'repeat acceptance does not overwrite original evidence');
});

test('creator terms acceptance is append-only per version', async () => {
  const termsCreator = `terms_creator_${process.pid}`;
  await getOrCreateCreator(termsCreator, 'termscreator', 'Terms Creator');
  assert.equal(await hasAcceptedCurrentCreatorTerms(termsCreator), false);
  const current = await acceptCreatorTerms(termsCreator, '127.0.0.1', 'creator-agent');
  assert.ok(current.accepted_at);
  assert.equal(await hasAcceptedCurrentCreatorTerms(termsCreator), true);

  await getClient().execute({
    sql: `INSERT INTO creator_terms_acceptance (creator_id, terms_version, accepted_ip, user_agent)
          VALUES (?, 'legacy-v1', '127.0.0.2', 'legacy-agent')`,
    args: [termsCreator],
  });
  await acceptCreatorTerms(termsCreator, '127.0.0.3', 'repeat-agent');
  const versions = await getClient().execute({
    sql: 'SELECT terms_version, accepted_ip, user_agent FROM creator_terms_acceptance WHERE creator_id = ? ORDER BY terms_version',
    args: [termsCreator],
  });
  assert.equal(versions.rows.length, 2, 'each creator terms version is retained exactly once');
  assert.equal(versions.rows.find((row) => row.terms_version !== 'legacy-v1').accepted_ip, '127.0.0.1');
  assert.equal(versions.rows.find((row) => row.terms_version === 'legacy-v1').user_agent, 'legacy-agent');
});

test('file offers and sub-minimum offers fail closed', async () => {
  await getOrCreateCreator(creator, 'policy', 'Policy Test');

  await createProduct('draftpol1', creator, 'Draft file', '', 100, 'file', 'description', null);
  assert.equal(await getProduct('draftpol1'), null, 'file without media must not be purchasable');
  assert.equal(Number((await getProductRaw('draftpol1')).active), 0);

  await attachFileToProduct('draftpol1', 'telegram-file-id', 'document');
  assert.ok(await getProduct('draftpol1'), 'media upload publishes a valid file offer');

  await createProduct('lowpol22', creator, 'Legacy low price', '', 19, 'text', 'body', null);
  assert.equal(await getProduct('lowpol22'), null, 'sub-minimum offer must not be purchasable');
  assert.equal(await setProductActive('lowpol22', true), false, 'admin cannot bypass the minimum');
});

test('editing an intentionally unpublished offer preserves its state and applies the edit', async () => {
  const productId = 'offedit2';
  await createProduct(productId, creator, 'Original title', '', 100, 'text', 'body', null);
  assert.equal(await setProductActive(productId, false), true);

  const edited = await updateProduct(productId, creator, { title: 'Updated title' });
  assert.equal(edited.title, 'Updated title');
  assert.equal(Number(edited.active), 0, 'editing must not silently republish the offer');
  assert.equal(await getProduct(productId), null, 'the unpublished offer stays out of public reads');

  const fileProductId = 'offfile2';
  await createProduct(fileProductId, creator, 'Moderated file', '', 100, 'file', 'body', null);
  await attachFileToProduct(fileProductId, 'first-file', 'document');
  await setProductActive(fileProductId, false);
  await attachFileToProduct(fileProductId, 'replacement-file', 'document');
  const replaced = await getProductRaw(fileProductId);
  assert.equal(replaced.file_id, 'replacement-file');
  assert.equal(Number(replaced.active), 0, 'replacing media must not bypass an admin disable');
});

test('only one non-refunded Stars entitlement can exist per buyer and product', async () => {
  const productId = 'oneact22';
  const buyerId = `one_active_buyer_${process.pid}`;
  const uniqueCreator = `unique_creator_${process.pid}`;
  await getOrCreateCreator(uniqueCreator, 'unique', 'Unique Test');
  await createProduct(productId, uniqueCreator, 'Single entitlement', '', 100, 'text', 'body', null);
  await recordPurchase(productId, buyerId, 100, 95, 5, `one_active_a_${process.pid}`);
  await assert.rejects(
    recordPurchase(productId, buyerId, 100, 95, 5, `one_active_b_${process.pid}`),
    /UNIQUE constraint|active purchase exists/,
  );
  await markPurchaseRefunded(productId, buyerId);
  await recordPurchase(productId, buyerId, 100, 95, 5, `one_active_c_${process.pid}`);
});

test('only cleared earnings enter a payout and the conversion rate is locked', async () => {
  const productId = 'payhold1';
  await createProduct(productId, creator, 'Payout hold test', '', 1100, 'text', 'body', null);
  await recordPurchase(productId, `buyer_${process.pid}`, 1052, 1000, 52, `hold_charge_${process.pid}`);

  let summary = await getCreatorFinancialSummary(creator);
  assert.equal(summary.totals.available_stars, 0);
  assert.equal(summary.totals.held_stars, 1000);
  assert.deepEqual(await createPayoutsFromUnassigned(creator), []);

  await getClient().execute({
    sql: `UPDATE purchases SET created_at = datetime('now', '-' || ? || ' days') WHERE telegram_charge_id = ?`,
    args: [String(PAYOUT_HOLD_DAYS + 1), `hold_charge_${process.pid}`],
  });

  summary = await getCreatorFinancialSummary(creator);
  assert.equal(summary.totals.available_stars, 1000);
  assert.equal(summary.totals.held_stars, 0);

  const created = await createPayoutsFromUnassigned(creator);
  assert.equal(created.length, 1);
  const details = await getPayoutDetails(created[0].payout_id);
  assert.equal(Number(details.payout.amount_stars), 1000);
  assert.equal(Number(details.payout.eur_per_star), PAYOUT_EUR_PER_STAR);
  assert.equal(Number(details.payout.amount_eur_cents), Math.round(1000 * PAYOUT_EUR_PER_STAR * 100));

  assert.equal(await markPayoutPaid(created[0].payout_id), true);
  assert.equal(await markPurchaseRefunded(productId, `buyer_${process.pid}`), true);
  summary = await getCreatorFinancialSummary(creator);
  assert.equal(summary.totals.available_stars, -1000, 'paid refund becomes a recoverable negative adjustment');

  const replacementId = 'payhold2';
  await createProduct(replacementId, creator, 'Future earnings', '', 2100, 'text', 'body', null);
  await recordPurchase(replacementId, `buyer2_${process.pid}`, 2100, 2000, 100, `future_charge_${process.pid}`);
  await getClient().execute({
    sql: `UPDATE purchases SET created_at = datetime('now', '-' || ? || ' days') WHERE telegram_charge_id = ?`,
    args: [String(PAYOUT_HOLD_DAYS + 1), `future_charge_${process.pid}`],
  });

  const recovered = await createPayoutsFromUnassigned(creator);
  assert.equal(recovered.length, 1);
  const recoveredDetails = await getPayoutDetails(recovered[0].payout_id);
  assert.equal(Number(recoveredDetails.payout.amount_stars), 1000, 'future payout nets the paid refund adjustment');
  assert.ok(recoveredDetails.purchases.some((row) => String(row.id).startsWith('adjustment-')));
});
