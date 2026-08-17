import { createClient } from '@libsql/client';
import { BUYER_TERMS_VERSION, CREATOR_TERMS_VERSION, MIN_PRICE_STARS, PAYOUT_EUR_PER_STAR, PAYOUT_HOLD_DAYS } from './config.js';
import { PROCESSED_UPDATES_CLEANUP_RATE, PROCESSED_UPDATES_TTL_DAYS } from './config.js';
import { MIN_PAYOUT_STARS } from './constants.js';

const isUniqueConstraintError = (err) => err?.message?.includes('UNIQUE constraint');

/**
 * Serialize a product row for client responses. Strips the gated content and the
 * Telegram file_id by default, and limits owner-only business metadata
 * (creator_id, sales_count, views) to the owner. Centralizing this here means a
 * new/refactored route cannot accidentally leak paid content or seller data.
 *
 * @param {object|null} p           raw product row
 * @param {object}      opts
 * @param {boolean}     opts.includeContent  include the paid `content` (buyer/owner only)
 * @param {boolean}     opts.isOwner         include owner-only metadata
 */
export function toPublicProduct(p, { includeContent = false, isOwner = false } = {}) {
  if (!p) return p;
  const pub = {
    id: p.id,
    title: p.title,
    description: p.description,
    price_stars: p.price_stars,
    price_usd_cents: p.price_usd_cents,
    price_eur_cents: p.price_eur_cents,
    content_type: p.content_type,
    file_kind: p.file_kind,
    payment_methods: p.payment_methods,
    is_ready: p.content_type !== 'file' || Boolean(String(p.file_id || '').trim()),
    active: p.active,
    created_at: p.created_at,
    sales_count: p.sales_count, // shown as public social proof on the buy page
  };
  if (isOwner) {
    // Seller's raw Telegram id and internal analytics — owner only.
    pub.creator_id = p.creator_id;
    pub.views = p.views;
  }
  if (includeContent) pub.content = p.content;
  return pub;
}

let client;

export function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

// Graceful shutdown: close the DB client on process exit
function closeClient() {
  if (client) {
    try { client.close(); } catch {}
    client = undefined;
  }
}
process.on('SIGTERM', closeClient);
process.on('SIGINT', closeClient);

let initPromise = null;

async function ensureTables() {
  if (initPromise) return initPromise;
  initPromise = _ensureTablesImpl();
  return initPromise;
}

async function _ensureTablesImpl() {
  const db = getClient();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS creators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE NOT NULL,
      username TEXT,
      display_name TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      price_stars INTEGER NOT NULL,
      content_type TEXT NOT NULL CHECK(content_type IN ('text', 'file', 'link', 'message')),
      content TEXT NOT NULL,
      file_id TEXT,
      file_kind TEXT DEFAULT 'document',
      active INTEGER DEFAULT 1,
      admin_disabled INTEGER DEFAULT 0,
      deleted_at TEXT,
      sales_count INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (creator_id) REFERENCES creators(telegram_id)
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      buyer_telegram_id TEXT NOT NULL,
      stars_paid INTEGER NOT NULL,
      creator_share INTEGER NOT NULL,
      platform_fee INTEGER NOT NULL,
      telegram_charge_id TEXT UNIQUE,
      refunded INTEGER DEFAULT 0,
      payout_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS fiat_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      buyer_telegram_id TEXT NOT NULL,
      stripe_session_id TEXT UNIQUE,
      stripe_payment_intent_id TEXT,
      currency TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      creator_share_cents INTEGER NOT NULL,
      platform_fee_cents INTEGER NOT NULL,
      refunded INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id),
      UNIQUE(product_id, buyer_telegram_id)
    );

    CREATE TABLE IF NOT EXISTS stripe_fulfillments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stripe_session_id TEXT,
      stripe_payment_intent_id TEXT,
      product_id TEXT NOT NULL,
      buyer_telegram_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      product_id TEXT,
      creator_id TEXT,
      buyer_telegram_id TEXT,
      source TEXT,
      meta TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS creator_channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id TEXT NOT NULL,
      chat_id TEXT NOT NULL,
      chat_title TEXT,
      chat_type TEXT,
      can_post INTEGER DEFAULT 1,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(creator_id, chat_id)
    );

    CREATE TABLE IF NOT EXISTS payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id TEXT NOT NULL,
      amount_stars INTEGER NOT NULL,
      eur_per_star REAL,
      amount_eur_cents INTEGER,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS creator_adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id TEXT NOT NULL,
      purchase_id INTEGER NOT NULL UNIQUE,
      amount_stars INTEGER NOT NULL,
      reason TEXT NOT NULL,
      payout_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS processed_updates (
      update_id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pending_attaches (
      chat_id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS delivery_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_type TEXT NOT NULL DEFAULT 'stars',
      product_id TEXT NOT NULL,
      buyer_telegram_id TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 3,
      next_retry_at TEXT DEFAULT (datetime('now')),
      last_error TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_telegram_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      status TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS creator_terms_acceptance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id TEXT NOT NULL,
      terms_version TEXT NOT NULL,
      accepted_at TEXT DEFAULT (datetime('now')),
      accepted_ip TEXT,
      user_agent TEXT,
      UNIQUE(creator_id, terms_version)
    );

    CREATE TABLE IF NOT EXISTS buyer_terms_acceptance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id TEXT NOT NULL,
      terms_version TEXT NOT NULL,
      accepted_at TEXT DEFAULT (datetime('now')),
      accepted_ip TEXT,
      user_agent TEXT,
      source TEXT,
      UNIQUE(buyer_id, terms_version)
    );

    CREATE TABLE IF NOT EXISTS creator_profiles (
      creator_id TEXT PRIMARY KEY,
      legal_name TEXT,
      email TEXT,
      country TEXT,
      payout_method TEXT,
      payout_details TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migration: add columns if they don't exist (safe for existing DBs)
  const migrations = [
    "ALTER TABLE products ADD COLUMN views INTEGER DEFAULT 0",
    "ALTER TABLE products ADD COLUMN price_usd_cents INTEGER",
    "ALTER TABLE products ADD COLUMN price_eur_cents INTEGER",
    "ALTER TABLE products ADD COLUMN payment_methods TEXT DEFAULT 'stars'",
    "ALTER TABLE products ADD COLUMN file_kind TEXT DEFAULT 'document'",
    "ALTER TABLE products ADD COLUMN deleted_at TEXT",
    "ALTER TABLE products ADD COLUMN admin_disabled INTEGER DEFAULT 0",
    "ALTER TABLE purchases ADD COLUMN refunded INTEGER DEFAULT 0",
    "ALTER TABLE purchases ADD COLUMN payout_id INTEGER",
    "ALTER TABLE payouts ADD COLUMN paid_at TEXT",
    "ALTER TABLE payouts ADD COLUMN eur_per_star REAL",
    "ALTER TABLE payouts ADD COLUMN amount_eur_cents INTEGER",
    "ALTER TABLE payouts ADD COLUMN invoice_ref TEXT",
    "ALTER TABLE payouts ADD COLUMN invoice_url TEXT",
    "ALTER TABLE payouts ADD COLUMN invoice_notes TEXT",
    "ALTER TABLE payouts ADD COLUMN invoice_submitted_at TEXT",
    "DROP INDEX IF EXISTS idx_fiat_purchases_payment_intent",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_fiat_purchases_payment_intent ON fiat_purchases(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_fiat_purchases_buyer_product ON fiat_purchases(product_id, buyer_telegram_id)",
    // Append-only ledger of consumed Stripe ids so idempotency survives a
    // reactivate that overwrites the mutable fiat_purchases row's ids.
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_fulfillments_session ON stripe_fulfillments(stripe_session_id) WHERE stripe_session_id IS NOT NULL AND stripe_session_id != ''",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_fulfillments_pi ON stripe_fulfillments(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL AND stripe_payment_intent_id != ''",
    "CREATE INDEX IF NOT EXISTS idx_events_type_created ON events(event_type, created_at)",
    "CREATE INDEX IF NOT EXISTS idx_events_product ON events(product_id)",
    "CREATE INDEX IF NOT EXISTS idx_creator_channels_creator ON creator_channels(creator_id) WHERE active = 1",
  ];
  for (const sql of migrations) {
    try { await db.execute(sql); } catch { /* column already exists */ }
  }

  // Preserve the rate used by the previous release for payouts created before
  // per-payout rate locking existed. Never reinterpret historical statements at
  // the new default rate.
  await db.execute('UPDATE payouts SET eur_per_star = 0.0185 WHERE eur_per_star IS NULL');
  await db.execute(`UPDATE payouts
                    SET amount_eur_cents = CAST(round(amount_stars * eur_per_star * 100) AS INTEGER)
                    WHERE amount_eur_cents IS NULL`);

  // Preserve every version of creator consent. The first schema kept one
  // mutable row per creator, which would otherwise erase the evidence for v1
  // when that creator accepts v2.
  const creatorTermsSchema = await db.execute(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'creator_terms_acceptance' LIMIT 1",
  );
  if (/creator_id\s+TEXT\s+PRIMARY\s+KEY/i.test(String(creatorTermsSchema.rows[0]?.sql || ''))) {
    await db.executeMultiple(`
      BEGIN;
      CREATE TABLE creator_terms_acceptance_append_only (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creator_id TEXT NOT NULL,
        terms_version TEXT NOT NULL,
        accepted_at TEXT DEFAULT (datetime('now')),
        accepted_ip TEXT,
        user_agent TEXT,
        UNIQUE(creator_id, terms_version)
      );
      INSERT INTO creator_terms_acceptance_append_only
        (creator_id, terms_version, accepted_at, accepted_ip, user_agent)
      SELECT creator_id, terms_version, accepted_at, accepted_ip, user_agent
      FROM creator_terms_acceptance;
      DROP TABLE creator_terms_acceptance;
      ALTER TABLE creator_terms_acceptance_append_only RENAME TO creator_terms_acceptance;
      COMMIT;
    `);
  }
  await db.execute('CREATE INDEX IF NOT EXISTS idx_creator_terms_current ON creator_terms_acceptance(creator_id, terms_version)');

  // The first buyer-consent table stored one mutable row per buyer. Rebuild it
  // as append-only per terms version so accepting vNext never destroys proof of
  // acceptance for an earlier purchase.
  const buyerTermsSchema = await db.execute(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'buyer_terms_acceptance' LIMIT 1",
  );
  if (/buyer_id\s+TEXT\s+PRIMARY\s+KEY/i.test(String(buyerTermsSchema.rows[0]?.sql || ''))) {
    await db.executeMultiple(`
      BEGIN;
      CREATE TABLE buyer_terms_acceptance_append_only (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        buyer_id TEXT NOT NULL,
        terms_version TEXT NOT NULL,
        accepted_at TEXT DEFAULT (datetime('now')),
        accepted_ip TEXT,
        user_agent TEXT,
        source TEXT,
        UNIQUE(buyer_id, terms_version)
      );
      INSERT INTO buyer_terms_acceptance_append_only
        (buyer_id, terms_version, accepted_at, accepted_ip, user_agent, source)
      SELECT buyer_id, terms_version, accepted_at, accepted_ip, user_agent, source
      FROM buyer_terms_acceptance;
      DROP TABLE buyer_terms_acceptance;
      ALTER TABLE buyer_terms_acceptance_append_only RENAME TO buyer_terms_acceptance;
      COMMIT;
    `);
  }
  await db.execute('CREATE INDEX IF NOT EXISTS idx_buyer_terms_current ON buyer_terms_acceptance(buyer_id, terms_version)');

  // Older databases enforced one mutable Stars row per (product, buyer). That
  // made a legitimate repurchase after refund overwrite the original charge
  // and payout association. Rebuild once without that UNIQUE constraint so the
  // purchase ledger is append-only. Existing ids and payout links are retained.
  const purchasesSchema = await db.execute(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'purchases' LIMIT 1",
  );
  if (/UNIQUE\s*\(\s*product_id\s*,\s*buyer_telegram_id\s*\)/i.test(String(purchasesSchema.rows[0]?.sql || ''))) {
    await db.executeMultiple(`
      BEGIN;
      CREATE TABLE purchases_append_only (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        buyer_telegram_id TEXT NOT NULL,
        stars_paid INTEGER NOT NULL,
        creator_share INTEGER NOT NULL,
        platform_fee INTEGER NOT NULL,
        telegram_charge_id TEXT UNIQUE,
        refunded INTEGER DEFAULT 0,
        payout_id INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
      INSERT INTO purchases_append_only
        (id, product_id, buyer_telegram_id, stars_paid, creator_share, platform_fee, telegram_charge_id, refunded, payout_id, created_at)
      SELECT id, product_id, buyer_telegram_id, stars_paid, creator_share, platform_fee, telegram_charge_id, refunded, payout_id, created_at
      FROM purchases;
      DROP TABLE purchases;
      ALTER TABLE purchases_append_only RENAME TO purchases;
      COMMIT;
    `);
  }
  await db.execute('CREATE INDEX IF NOT EXISTS idx_purchases_buyer_product ON purchases(product_id, buyer_telegram_id, refunded)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_purchases_payout ON purchases(payout_id)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_adjustments_creator_payout ON creator_adjustments(creator_id, payout_id)');
  try {
    await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_one_active_entitlement
                      ON purchases(product_id, buyer_telegram_id) WHERE refunded = 0`);
  } catch (err) {
    // A legacy database may already contain duplicate paid rows. Do not rewrite
    // financial history automatically, but prevent any additional duplicates.
    console.error('Active-purchase unique index needs manual legacy reconciliation:', err?.message || err);
    await db.execute(`CREATE TRIGGER IF NOT EXISTS prevent_new_duplicate_active_purchase
      BEFORE INSERT ON purchases
      WHEN EXISTS (
        SELECT 1 FROM purchases
        WHERE product_id = NEW.product_id
          AND buyer_telegram_id = NEW.buyer_telegram_id
          AND refunded = 0
      )
      BEGIN
        SELECT RAISE(ABORT, 'active purchase exists');
      END`);
  }

  // Policy/readiness repair. These updates are intentionally idempotent and
  // make legacy rows fail closed after a deployment.
  await db.execute("UPDATE products SET payment_methods = 'stars' WHERE payment_methods IS NULL OR payment_methods != 'stars'");
  // Reconstruct known admin disables from the audit log. All other valid,
  // inactive legacy rows predate `deleted_at` and were creator deletions, so
  // preserve them as tombstones instead of resurfacing them in dashboards.
  await db.execute({
    sql: `UPDATE products SET admin_disabled = 1
          WHERE active = 0 AND deleted_at IS NULL
            AND (
              SELECT action FROM admin_actions
              WHERE target_type = 'product' AND target_id = products.id
                AND action IN ('disable_product', 'enable_product') AND status = 'ok'
              ORDER BY id DESC LIMIT 1
            ) = 'disable_product'`,
    args: [],
  });
  await db.execute({
    sql: `UPDATE products SET deleted_at = COALESCE(deleted_at, created_at)
          WHERE active = 0 AND admin_disabled = 0 AND deleted_at IS NULL AND price_stars >= ?
            AND (content_type != 'file' OR (file_id IS NOT NULL AND trim(file_id) != ''))`,
    args: [MIN_PRICE_STARS],
  });
  await db.execute({
    sql: `UPDATE products SET active = 0
          WHERE active = 1 AND price_stars < ?`,
    args: [MIN_PRICE_STARS],
  });
  await db.execute(`UPDATE products SET active = 0
                    WHERE active = 1 AND content_type = 'file'
                      AND (file_id IS NULL OR trim(file_id) = '')`);

  // Backfill consumed ids from existing card purchases so the replay guard also
  // covers rows created before the ledger existed. Kept OUT of the silent loop
  // above: a failure here matters (those rows stay replayable), so it is logged
  // and retried on the next cold start rather than hidden. Idempotent via
  // OR IGNORE against the unique indexes; a no-op once every row is present.
  try {
    await db.execute(
      `INSERT OR IGNORE INTO stripe_fulfillments (stripe_session_id, stripe_payment_intent_id, product_id, buyer_telegram_id)
       SELECT stripe_session_id, stripe_payment_intent_id, product_id, buyer_telegram_id FROM fiat_purchases`,
    );
  } catch (err) {
    console.error('stripe_fulfillments backfill failed (will retry next cold start):', err?.message || err);
  }

}

// Creator operations
export async function getOrCreateCreator(telegramId, username, displayName) {
  await ensureTables();
  const db = getClient();
  await db.execute({
    sql: `INSERT INTO creators (telegram_id, username, display_name) VALUES (?, ?, ?)
      ON CONFLICT(telegram_id) DO UPDATE SET username = excluded.username, display_name = excluded.display_name`,
    args: [telegramId, username, displayName],
  });
  const result = await db.execute({ sql: 'SELECT * FROM creators WHERE telegram_id = ?', args: [telegramId] });
  return result.rows[0];
}

export async function getCreatorTermsAcceptance(creatorId, termsVersion = null) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `SELECT creator_id, terms_version, accepted_at
          FROM creator_terms_acceptance
          WHERE creator_id = ? ${termsVersion ? 'AND terms_version = ?' : ''}
          ORDER BY accepted_at DESC, id DESC LIMIT 1`,
    args: termsVersion ? [String(creatorId), String(termsVersion)] : [String(creatorId)],
  });
  return result.rows[0] || null;
}

export async function acceptCreatorTerms(creatorId, acceptedIp = null, userAgent = null) {
  await ensureTables();
  await getClient().execute({
    sql: `INSERT INTO creator_terms_acceptance (creator_id, terms_version, accepted_ip, user_agent)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(creator_id, terms_version) DO NOTHING`,
    args: [String(creatorId), CREATOR_TERMS_VERSION, acceptedIp, userAgent],
  });
  return getCreatorTermsAcceptance(creatorId, CREATOR_TERMS_VERSION);
}

export async function hasAcceptedCurrentCreatorTerms(creatorId) {
  return Boolean(await getCreatorTermsAcceptance(creatorId, CREATOR_TERMS_VERSION));
}

export async function getBuyerTermsAcceptance(buyerId, termsVersion = null) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `SELECT buyer_id, terms_version, accepted_at, source
          FROM buyer_terms_acceptance
          WHERE buyer_id = ? ${termsVersion ? 'AND terms_version = ?' : ''}
          ORDER BY accepted_at DESC, id DESC LIMIT 1`,
    args: termsVersion ? [String(buyerId), String(termsVersion)] : [String(buyerId)],
  });
  return result.rows[0] || null;
}

export async function acceptBuyerTerms(buyerId, acceptedIp = null, userAgent = null, source = 'miniapp') {
  await ensureTables();
  await getClient().execute({
    sql: `INSERT OR IGNORE INTO buyer_terms_acceptance
            (buyer_id, terms_version, accepted_ip, user_agent, source)
          VALUES (?, ?, ?, ?, ?)`,
    args: [String(buyerId), BUYER_TERMS_VERSION, acceptedIp, userAgent, source],
  });
  return getBuyerTermsAcceptance(buyerId, BUYER_TERMS_VERSION);
}

export async function hasAcceptedCurrentBuyerTerms(buyerId) {
  return Boolean(await getBuyerTermsAcceptance(buyerId, BUYER_TERMS_VERSION));
}

export async function getCreatorProfile(creatorId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `SELECT creator_id, legal_name, email, country, payout_method, payout_details, updated_at
          FROM creator_profiles WHERE creator_id = ? LIMIT 1`,
    args: [String(creatorId)],
  });
  return result.rows[0] || null;
}

export async function upsertCreatorProfile(creatorId, profile = {}) {
  await ensureTables();
  const legalName = String(profile.legal_name || '').trim() || null;
  const email = String(profile.email || '').trim() || null;
  const country = String(profile.country || '').trim().toUpperCase() || null;
  const payoutMethod = String(profile.payout_method || '').trim() || null;
  const payoutDetails = String(profile.payout_details || '').trim() || null;

  await getClient().execute({
    sql: `INSERT INTO creator_profiles (creator_id, legal_name, email, country, payout_method, payout_details, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(creator_id) DO UPDATE SET
            legal_name = excluded.legal_name,
            email = excluded.email,
            country = excluded.country,
            payout_method = excluded.payout_method,
            payout_details = excluded.payout_details,
            updated_at = datetime('now')`,
    args: [String(creatorId), legalName, email, country, payoutMethod, payoutDetails],
  });

  return getCreatorProfile(creatorId);
}

export async function getCreatorFinancialSummary(creatorId) {
  await ensureTables();
  const db = getClient();

  const stars = await db.execute({
    sql: `SELECT
      COUNT(*) as sales_count,
      COALESCE(SUM(stars_paid), 0) as gross_stars,
      COALESCE(SUM(platform_fee), 0) as fee_stars,
      COALESCE(SUM(creator_share), 0) as net_stars
    FROM purchases
    WHERE refunded = 0
      AND product_id IN (SELECT id FROM products WHERE creator_id = ?)`,
    args: [String(creatorId)],
  });

  const pending = await db.execute({
    sql: `SELECT COALESCE(SUM(creator_share), 0) as pending_stars
          FROM purchases
          WHERE refunded = 0 AND payout_id IS NULL
            AND product_id IN (SELECT id FROM products WHERE creator_id = ?)`,
    args: [String(creatorId)],
  });

  const available = await db.execute({
    sql: `SELECT COALESCE(SUM(creator_share), 0) as available_stars
          FROM purchases
          WHERE refunded = 0 AND payout_id IS NULL
            AND created_at <= datetime('now', '-' || ? || ' days')
            AND product_id IN (SELECT id FROM products WHERE creator_id = ?)`,
    args: [String(PAYOUT_HOLD_DAYS), String(creatorId)],
  });

  const adjustments = await db.execute({
    sql: `SELECT COALESCE(SUM(amount_stars), 0) AS adjustment_stars
          FROM creator_adjustments WHERE creator_id = ? AND payout_id IS NULL`,
    args: [String(creatorId)],
  });

  const paid = await db.execute({
    sql: `SELECT COALESCE(SUM(amount_stars), 0) as paid_stars
          FROM payouts WHERE creator_id = ? AND status = 'paid'`,
    args: [String(creatorId)],
  });

  const months = await db.execute({
    sql: `SELECT
            substr(p.created_at, 1, 7) as month,
            COUNT(*) as sales_count,
            COALESCE(SUM(p.stars_paid), 0) as gross_stars,
            COALESCE(SUM(p.platform_fee), 0) as fee_stars,
            COALESCE(SUM(p.creator_share), 0) as net_stars
          FROM purchases p
          JOIN products pr ON pr.id = p.product_id
          WHERE p.refunded = 0 AND pr.creator_id = ?
          GROUP BY substr(p.created_at, 1, 7)
          ORDER BY month DESC
          LIMIT 12`,
    args: [String(creatorId)],
  });

  const payouts = await db.execute({
    sql: `SELECT id, amount_stars, eur_per_star, amount_eur_cents, status, created_at, paid_at,
                 invoice_ref, invoice_url, invoice_notes, invoice_submitted_at
          FROM payouts
          WHERE creator_id = ?
          ORDER BY id DESC
          LIMIT 12`,
    args: [String(creatorId)],
  });

  const pendingPurchaseStars = Number(pending.rows[0]?.pending_stars || 0);
  const availablePurchaseStars = Number(available.rows[0]?.available_stars || 0);
  const adjustmentStars = Number(adjustments.rows[0]?.adjustment_stars || 0);

  return {
    totals: {
      sales_count: Number(stars.rows[0]?.sales_count || 0),
      gross_stars: Number(stars.rows[0]?.gross_stars || 0),
      fee_stars: Number(stars.rows[0]?.fee_stars || 0),
      net_stars: Number(stars.rows[0]?.net_stars || 0),
      pending_stars: pendingPurchaseStars + adjustmentStars,
      available_stars: availablePurchaseStars + adjustmentStars,
      held_stars: Math.max(0, pendingPurchaseStars - availablePurchaseStars),
      paid_stars: Number(paid.rows[0]?.paid_stars || 0),
    },
    months: months.rows || [],
    payouts: payouts.rows || [],
  };
}

// Product operations
export async function createProduct(
  id,
  creatorId,
  title,
  description,
  priceStars,
  contentType,
  content,
  fileId,
  fileKind = 'document',
  priceUsdCents = null,
  priceEurCents = null,
  paymentMethods = 'stars',
  active = Number(priceStars) >= MIN_PRICE_STARS && (contentType !== 'file' || Boolean(String(fileId || '').trim())),
) {
  await ensureTables();
  const db = getClient();
  await db.execute({
    sql: `INSERT INTO products (id, creator_id, title, description, price_stars, content_type, content, file_id, file_kind, price_usd_cents, price_eur_cents, payment_methods, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, creatorId, title, description, priceStars, contentType, content, fileId, fileKind,
      priceUsdCents, priceEurCents, 'stars',
      active && Number(priceStars) >= MIN_PRICE_STARS && (contentType !== 'file' || Boolean(String(fileId || '').trim())) ? 1 : 0,
    ],
  });
  const result = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
  return result.rows[0];
}

export async function getProduct(id) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `SELECT * FROM products WHERE id = ? AND active = 1 AND deleted_at IS NULL
          AND (content_type != 'file' OR (file_id IS NOT NULL AND trim(file_id) != ''))`,
    args: [id],
  });
  return result.rows[0] || null;
}

export async function getCreatorProducts(creatorId, includeInactive = false) {
  await ensureTables();
  const result = await getClient().execute({
    sql: 'SELECT * FROM products WHERE creator_id = ? AND deleted_at IS NULL ORDER BY created_at DESC',
    args: [creatorId],
  });
  return result.rows;
}

export async function getCreatorStats(creatorId) {
  await ensureTables();
  const db = getClient();
  const products = await db.execute({ sql: 'SELECT COUNT(*) as count FROM products WHERE creator_id = ? AND active = 1', args: [creatorId] });
  const sales = await db.execute({
    sql: 'SELECT COUNT(*) as count, COALESCE(SUM(creator_share), 0) as total_stars FROM purchases WHERE refunded = 0 AND product_id IN (SELECT id FROM products WHERE creator_id = ?)',
    args: [creatorId],
  });
  return { products: Number(products.rows[0].count), sales: Number(sales.rows[0].count), totalStars: Number(sales.rows[0].total_stars) };
}

// Purchase operations
export async function recordPurchase(productId, buyerTelegramId, starsPaid, creatorShare, platformFee, chargeId, queueDelivery = true) {
  await ensureTables();
  const db = getClient();
  const tx = await db.transaction('write');
  try {
    await tx.execute({
      sql: `INSERT INTO purchases (product_id, buyer_telegram_id, stars_paid, creator_share, platform_fee, telegram_charge_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
      args: [productId, buyerTelegramId, starsPaid, creatorShare, platformFee, chargeId],
    });
    await tx.execute({ sql: 'UPDATE products SET sales_count = sales_count + 1 WHERE id = ?', args: [productId] });
    if (queueDelivery) {
      await tx.execute({
        sql: `INSERT INTO delivery_queue (product_id, buyer_telegram_id, purchase_type)
              SELECT ?, ?, 'stars'
              WHERE NOT EXISTS (
                SELECT 1 FROM delivery_queue
                WHERE product_id = ? AND buyer_telegram_id = ? AND status = 'pending'
              )`,
        args: [productId, String(buyerTelegramId), productId, String(buyerTelegramId)],
      });
    }
    await tx.commit();
  } catch (err) {
    await tx.rollback().catch(() => {});
    throw err;
  }
}

export async function hasPurchased(productId, buyerTelegramId) {
  await ensureTables();
  const db = getClient();
  const stars = await db.execute({
    sql: 'SELECT 1 FROM purchases WHERE product_id = ? AND buyer_telegram_id = ? AND refunded = 0 LIMIT 1',
    args: [productId, buyerTelegramId],
  });
  if (stars.rows.length > 0) return true;

  const fiat = await db.execute({
    sql: 'SELECT 1 FROM fiat_purchases WHERE product_id = ? AND buyer_telegram_id = ? AND refunded = 0 LIMIT 1',
    args: [productId, buyerTelegramId],
  });
  return fiat.rows.length > 0;
}

export async function recordFiatPurchase(
  productId,
  buyerTelegramId,
  amountCents,
  currency,
  creatorShareCents,
  platformFeeCents,
  stripeSessionId,
  stripePaymentIntentId = null,
) {
  await ensureTables();
  const db = getClient();
  const sid = stripeSessionId ? String(stripeSessionId) : null;
  const pi = stripePaymentIntentId ? String(stripePaymentIntentId) : null;
  // The purchase row and the consumed-id ledger entry are committed atomically,
  // so the replay guard can never be missing for a committed purchase, and any
  // failure rolls the whole thing back for a clean retry (self-healing).
  const tx = await db.transaction('write');
  try {
    await tx.execute({
      sql: `INSERT INTO fiat_purchases
        (product_id, buyer_telegram_id, stripe_session_id, stripe_payment_intent_id, currency, amount_cents, creator_share_cents, platform_fee_cents)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        productId,
        buyerTelegramId,
        stripeSessionId,
        stripePaymentIntentId,
        String(currency || '').toUpperCase(),
        Number(amountCents),
        Number(creatorShareCents),
        Number(platformFeeCents),
      ],
    });
    await tx.execute({ sql: 'UPDATE products SET sales_count = sales_count + 1 WHERE id = ?', args: [productId] });
    if (sid || pi) {
      await tx.execute({
        sql: `INSERT OR IGNORE INTO stripe_fulfillments (stripe_session_id, stripe_payment_intent_id, product_id, buyer_telegram_id)
          VALUES (?, ?, ?, ?)`,
        args: [sid, pi, productId, buyerTelegramId],
      });
    }
    await tx.execute({
      sql: `INSERT INTO delivery_queue (product_id, buyer_telegram_id, purchase_type)
            SELECT ?, ?, 'stripe'
            WHERE NOT EXISTS (
              SELECT 1 FROM delivery_queue
              WHERE product_id = ? AND buyer_telegram_id = ? AND status = 'pending'
            )`,
      args: [productId, String(buyerTelegramId), productId, String(buyerTelegramId)],
    });
    await tx.commit();
  } catch (err) {
    await tx.rollback().catch(() => {});
    throw err;
  }
}

/**
 * Reactivate a previously-refunded fiat (Stripe) purchase for the same (product, buyer).
 * Historical card rows still enforce UNIQUE(product_id, buyer_telegram_id), so
 * a legitimate re-purchase after a refund updates that row while the separate
 * Stripe fulfillment ledger preserves every consumed session and intent id.
 */
export async function reactivateFiatPurchase(
  productId,
  buyerTelegramId,
  amountCents,
  currency,
  creatorShareCents,
  platformFeeCents,
  stripeSessionId,
  stripePaymentIntentId = null,
) {
  await ensureTables();
  const db = getClient();
  const sid = stripeSessionId ? String(stripeSessionId) : null;
  const pi = stripePaymentIntentId ? String(stripePaymentIntentId) : null;
  // Reactivate the refunded row and append the new consumed ids atomically: the
  // old ids stay in the append-only ledger (never overwritten), and the new row
  // state plus its ledger entry commit together or not at all.
  const tx = await db.transaction('write');
  try {
    const result = await tx.execute({
      sql: `UPDATE fiat_purchases
        SET refunded = 0, stripe_session_id = ?, stripe_payment_intent_id = ?, currency = ?,
            amount_cents = ?, creator_share_cents = ?, platform_fee_cents = ?, created_at = datetime('now')
        WHERE product_id = ? AND buyer_telegram_id = ? AND refunded = 1`,
      args: [
        stripeSessionId,
        stripePaymentIntentId,
        String(currency || '').toUpperCase(),
        Number(amountCents),
        Number(creatorShareCents),
        Number(platformFeeCents),
        productId,
        buyerTelegramId,
      ],
    });
    if (result.rowsAffected > 0) {
      await tx.execute({ sql: 'UPDATE products SET sales_count = sales_count + 1 WHERE id = ?', args: [productId] });
      if (sid || pi) {
        await tx.execute({
          sql: `INSERT OR IGNORE INTO stripe_fulfillments (stripe_session_id, stripe_payment_intent_id, product_id, buyer_telegram_id)
            VALUES (?, ?, ?, ?)`,
          args: [sid, pi, productId, buyerTelegramId],
        });
      }
      await tx.execute({
        sql: `INSERT INTO delivery_queue (product_id, buyer_telegram_id, purchase_type)
              SELECT ?, ?, 'stripe'
              WHERE NOT EXISTS (
                SELECT 1 FROM delivery_queue
                WHERE product_id = ? AND buyer_telegram_id = ? AND status = 'pending'
              )`,
        args: [productId, String(buyerTelegramId), productId, String(buyerTelegramId)],
      });
    }
    await tx.commit();
    return result.rowsAffected > 0;
  } catch (err) {
    await tx.rollback().catch(() => {});
    throw err;
  }
}

/**
 * True if either Stripe id was already consumed by a prior fulfillment. This
 * survives a reactivate that overwrites the fiat_purchases row's ids, so it is
 * the authoritative replay guard (e.g. a client re-submitting an old, refunded
 * but still payment_status='paid' session to /checkout/verify).
 */
export async function hasStripeFulfillment(stripeSessionId, stripePaymentIntentId) {
  await ensureTables();
  const sid = stripeSessionId ? String(stripeSessionId) : '';
  const pi = stripePaymentIntentId ? String(stripePaymentIntentId) : '';
  if (!sid && !pi) return false;
  const result = await getClient().execute({
    sql: `SELECT 1 FROM stripe_fulfillments
      WHERE (? != '' AND stripe_session_id = ?) OR (? != '' AND stripe_payment_intent_id = ?)
      LIMIT 1`,
    args: [sid, sid, pi, pi],
  });
  return result.rows.length > 0;
}

export async function hasFiatPurchaseBySession(stripeSessionId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: 'SELECT 1 FROM fiat_purchases WHERE stripe_session_id = ? LIMIT 1',
    args: [String(stripeSessionId)],
  });
  return result.rows.length > 0;
}

export async function hasFiatPurchaseByPaymentIntent(stripePaymentIntentId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: 'SELECT 1 FROM fiat_purchases WHERE stripe_payment_intent_id = ? LIMIT 1',
    args: [String(stripePaymentIntentId)],
  });
  return result.rows.length > 0;
}

/**
 * Reverse a fiat (Stripe) purchase on refund / chargeback / dispute, keyed by the
 * Stripe payment_intent id. Revokes access (hasPurchased excludes refunded rows)
 * and decrements the product sales counter. Returns true if a row was reversed.
 */
export async function markFiatPurchaseRefundedByPaymentIntent(paymentIntentId) {
  await ensureTables();
  const db = getClient();
  const pid = String(paymentIntentId || '');
  if (!pid) return null;
  const row = await db.execute({
    sql: 'SELECT product_id FROM fiat_purchases WHERE stripe_payment_intent_id = ? AND refunded = 0 LIMIT 1',
    args: [pid],
  });
  const productId = row.rows[0]?.product_id;
  const result = await db.execute({
    sql: 'UPDATE fiat_purchases SET refunded = 1 WHERE stripe_payment_intent_id = ? AND refunded = 0',
    args: [pid],
  });
  if (result.rowsAffected > 0 && productId) {
    await db.execute({
      sql: 'UPDATE products SET sales_count = CASE WHEN sales_count > 0 THEN sales_count - 1 ELSE 0 END WHERE id = ?',
      args: [productId],
    });
    return { product_id: productId };
  }
  return result.rowsAffected > 0 ? {} : null;
}

// Soft-delete a product (sets active = 0)
export async function softDeleteProduct(productId, creatorId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: "UPDATE products SET active = 0, deleted_at = datetime('now') WHERE id = ? AND creator_id = ? AND deleted_at IS NULL",
    args: [productId, creatorId],
  });
  return result.rowsAffected > 0;
}

export async function setProductActive(productId, active) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `UPDATE products SET active = ?, admin_disabled = ? WHERE id = ? AND deleted_at IS NULL
          AND (? = 0 OR price_stars >= ?)
          AND (? = 0 OR content_type != 'file' OR (file_id IS NOT NULL AND trim(file_id) != ''))`,
    args: [active ? 1 : 0, active ? 0 : 1, productId, active ? 1 : 0, MIN_PRICE_STARS, active ? 1 : 0],
  });
  return result.rowsAffected > 0;
}

// Update product fields (title, description, price)
export async function updateProduct(productId, creatorId, updates) {
  await ensureTables();
  const db = getClient();
  const currentResult = await db.execute({
    sql: `SELECT active, admin_disabled, price_stars, content_type, file_id
          FROM products
          WHERE id = ? AND creator_id = ? AND deleted_at IS NULL
          LIMIT 1`,
    args: [productId, creatorId],
  });
  const current = currentResult.rows[0];
  if (!current) return null;

  // `active = 0` represents both an intentional unpublish and a draft created
  // because its price/media was invalid. Only drafts should auto-publish once
  // corrected; editing an intentionally unpublished offer must preserve that
  // choice.
  const wasDraft = Number(current.price_stars) < MIN_PRICE_STARS
    || (current.content_type === 'file' && !String(current.file_id || '').trim());
  const fields = [];
  const args = [];
  if (updates.title !== undefined) { fields.push('title = ?'); args.push(updates.title); }
  if (updates.description !== undefined) { fields.push('description = ?'); args.push(updates.description); }
  if (updates.price_stars !== undefined) { fields.push('price_stars = ?'); args.push(updates.price_stars); }
  if (fields.length === 0) return null;
  args.push(productId, creatorId);
  await db.execute({
    sql: `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND creator_id = ? AND deleted_at IS NULL`,
    args,
  });
  if (wasDraft && Number(current.admin_disabled || 0) === 0) {
    await db.execute({
      sql: `UPDATE products SET active = 1 WHERE id = ? AND creator_id = ? AND deleted_at IS NULL
            AND price_stars >= ?
            AND (content_type != 'file' OR (file_id IS NOT NULL AND trim(file_id) != ''))`,
      args: [productId, creatorId, MIN_PRICE_STARS],
    });
  }
  return getProductRaw(productId);
}

// Pending attach state for /attach flow
export async function setPendingAttach(chatId, productId) {
  await ensureTables();
  await getClient().execute({
    sql: `INSERT INTO pending_attaches (chat_id, product_id) VALUES (?, ?)
          ON CONFLICT(chat_id) DO UPDATE SET product_id = excluded.product_id, created_at = datetime('now')`,
    args: [String(chatId), productId],
  });
}

export async function getPendingAttach(chatId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `SELECT product_id FROM pending_attaches WHERE chat_id = ? AND created_at > datetime('now', '-1 hour')`,
    args: [String(chatId)],
  });
  return result.rows[0]?.product_id || null;
}

export async function clearPendingAttach(chatId) {
  await ensureTables();
  await getClient().execute({
    sql: 'DELETE FROM pending_attaches WHERE chat_id = ?',
    args: [String(chatId)],
  });
}

// Attach a file_id to a product
export async function attachFileToProduct(productId, fileId, fileKind = 'document') {
  await ensureTables();
  const result = await getClient().execute({
    sql: `UPDATE products SET file_id = ?, file_kind = ?,
            active = CASE WHEN price_stars >= ? AND admin_disabled = 0 THEN 1 ELSE 0 END
          WHERE id = ? AND content_type = 'file' AND deleted_at IS NULL`,
    args: [fileId, fileKind, MIN_PRICE_STARS, productId],
  });
  return result.rowsAffected > 0;
}

async function applyStarsRefundAccounting(db, purchase) {
  const payoutId = Number(purchase?.payout_id || 0);
  if (!payoutId) return;

  const payoutResult = await db.execute({
    sql: 'SELECT id, amount_stars, eur_per_star, status FROM payouts WHERE id = ? LIMIT 1',
    args: [payoutId],
  });
  const payout = payoutResult.rows[0];
  if (!payout) return;

  const creatorShare = Number(purchase.creator_share || 0);
  if (payout.status === 'paid') {
    await db.execute({
      sql: `INSERT OR IGNORE INTO creator_adjustments
              (creator_id, purchase_id, amount_stars, reason)
            VALUES (?, ?, ?, 'refund_after_payout')`,
      args: [String(purchase.creator_id), Number(purchase.id), -creatorShare],
    });
    return;
  }

  const revisedStars = Math.max(0, Number(payout.amount_stars || 0) - creatorShare);
  const lockedRate = Number(payout.eur_per_star || PAYOUT_EUR_PER_STAR);
  await db.execute({
    sql: `UPDATE payouts
          SET amount_stars = ?, amount_eur_cents = ?,
              status = CASE
                WHEN ? = 0 THEN 'cancelled'
                WHEN status IN ('invoice_submitted', 'processing') THEN 'pending'
                ELSE status
              END,
              invoice_ref = CASE WHEN status IN ('invoice_submitted', 'processing') THEN NULL ELSE invoice_ref END,
              invoice_url = CASE WHEN status IN ('invoice_submitted', 'processing') THEN NULL ELSE invoice_url END,
              invoice_notes = CASE WHEN status IN ('invoice_submitted', 'processing') THEN NULL ELSE invoice_notes END,
              invoice_submitted_at = CASE WHEN status IN ('invoice_submitted', 'processing') THEN NULL ELSE invoice_submitted_at END
          WHERE id = ? AND status != 'paid'`,
    args: [revisedStars, Math.round(revisedStars * lockedRate * 100), revisedStars, payoutId],
  });
}

// Mark the latest active purchase for this buyer/product as refunded.
export async function markPurchaseRefunded(productId, buyerTelegramId) {
  await ensureTables();
  const db = getClient();
  const selected = await db.execute({
    sql: `SELECT p.*, pr.creator_id
          FROM purchases p JOIN products pr ON pr.id = p.product_id
          WHERE p.product_id = ? AND p.buyer_telegram_id = ? AND p.refunded = 0
          ORDER BY p.id DESC LIMIT 1`,
    args: [productId, buyerTelegramId],
  });
  const purchase = selected.rows[0];
  if (!purchase) return false;
  const result = await db.execute({
    sql: 'UPDATE purchases SET refunded = 1 WHERE id = ? AND refunded = 0',
    args: [Number(purchase.id)],
  });

  if (result.rowsAffected > 0) {
    await db.execute({
      sql: 'UPDATE products SET sales_count = CASE WHEN sales_count > 0 THEN sales_count - 1 ELSE 0 END WHERE id = ?',
      args: [productId],
    });
    await applyStarsRefundAccounting(db, purchase);
  }

  return result.rowsAffected > 0;
}

// Increment view counter for a product
export async function incrementViews(productId) {
  await ensureTables();
  await getClient().execute({
    sql: 'UPDATE products SET views = views + 1 WHERE id = ? AND active = 1',
    args: [productId],
  });
}

// ── Funnel analytics ─────────────────────────────────────────

/**
 * Append one funnel event. Best-effort: analytics must never affect a purchase
 * or a bot reply, so this never throws.
 */
export async function recordEvent({ eventType, productId = null, creatorId = null, buyerId = null, source = null, meta = null } = {}) {
  if (!eventType) return;
  try {
    await ensureTables();
    await getClient().execute({
      sql: `INSERT INTO events (event_type, product_id, creator_id, buyer_telegram_id, source, meta)
        VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        String(eventType),
        productId != null ? String(productId) : null,
        creatorId != null ? String(creatorId) : null,
        buyerId != null ? String(buyerId) : null,
        source != null ? String(source) : null,
        meta != null ? (typeof meta === 'string' ? meta : JSON.stringify(meta)) : null,
      ],
    });
  } catch (err) {
    console.error('recordEvent non-fatal error:', err?.message || err);
  }
}

/**
 * Counts per event_type over an optional window / product / creator filter.
 * Returns a flat map plus the derived funnel conversion so the admin view can
 * see where buyers drop (view -> checkout -> pay -> deliver).
 */
export async function getFunnelSummary({ from, to, productId, creatorId } = {}) {
  await ensureTables();
  const where = [];
  const args = [];
  if (from) { where.push('created_at >= ?'); args.push(String(from)); }
  if (to) { where.push('created_at <= ?'); args.push(String(to)); }
  if (productId) { where.push('product_id = ?'); args.push(String(productId)); }
  if (creatorId) { where.push('creator_id = ?'); args.push(String(creatorId)); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = (await getClient().execute({
    sql: `SELECT event_type, COUNT(*) n FROM events ${clause} GROUP BY event_type`,
    args,
  })).rows;

  const counts = {};
  for (const r of rows) counts[r.event_type] = Number(r.n);
  const view = counts.product_view || 0;
  const checkout = counts.checkout_start || 0;
  const paid = counts.payment_success || 0;
  const delivered = counts.delivered || 0;
  const pct = (num, den) => (den > 0 ? Math.round((num / den) * 1000) / 10 : null);

  return {
    counts,
    funnel: {
      product_view: view,
      checkout_start: checkout,
      payment_success: paid,
      delivered,
      view_to_checkout_pct: pct(checkout, view),
      checkout_to_paid_pct: pct(paid, checkout),
      view_to_paid_pct: pct(paid, view),
    },
  };
}

// ── Creator channels (broadcast targets) ─────────────────────

export async function upsertCreatorChannel(creatorId, chatId, chatTitle, chatType, canPost = true) {
  await ensureTables();
  await getClient().execute({
    sql: `INSERT INTO creator_channels (creator_id, chat_id, chat_title, chat_type, can_post, active)
      VALUES (?, ?, ?, ?, ?, 1)
      ON CONFLICT(creator_id, chat_id) DO UPDATE SET
        chat_title = excluded.chat_title,
        chat_type = excluded.chat_type,
        can_post = excluded.can_post,
        active = 1`,
    args: [String(creatorId), String(chatId), chatTitle != null ? String(chatTitle) : null, chatType != null ? String(chatType) : null, canPost ? 1 : 0],
  });
}

export async function deactivateCreatorChannel(creatorId, chatId) {
  await ensureTables();
  await getClient().execute({
    sql: 'UPDATE creator_channels SET active = 0 WHERE creator_id = ? AND chat_id = ?',
    args: [String(creatorId), String(chatId)],
  });
}

// Deactivate a chat for ALL creators. Used when the bot itself is removed or
// demoted from a chat: no creator can broadcast there any more, regardless of
// which admin performed the removal.
export async function deactivateChannel(chatId) {
  await ensureTables();
  await getClient().execute({
    sql: 'UPDATE creator_channels SET active = 0 WHERE chat_id = ?',
    args: [String(chatId)],
  });
}

export async function getCreatorChannels(creatorId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `SELECT chat_id, chat_title, chat_type, can_post FROM creator_channels
      WHERE creator_id = ? AND active = 1 AND can_post = 1 ORDER BY created_at DESC`,
    args: [String(creatorId)],
  });
  return result.rows;
}

/**
 * Get a product including inactive ones — INTERNAL USE ONLY.
 * Returns full record (including content). Never expose directly via API.
 * Used by: webhook (refund notifications, /attach command).
 */
export async function getProductRaw(id) {
  await ensureTables();
  const result = await getClient().execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
  return result.rows[0] || null;
}

/**
 * Mark a Telegram update_id as processed.
 * Returns true if this is the first time (new update), false if already seen.
 */
export async function markUpdateProcessed(updateId) {
  await ensureTables();
  const db = getClient();
  try {
    await db.execute({
      sql: 'INSERT INTO processed_updates (update_id) VALUES (?)',
      args: [String(updateId)],
    });

    // Best-effort cleanup with configurable TTL/sampling.
    if (Math.random() < PROCESSED_UPDATES_CLEANUP_RATE) {
      db.execute({
        sql: `DELETE FROM processed_updates WHERE created_at < datetime('now', '-' || ? || ' days')`,
        args: [String(PROCESSED_UPDATES_TTL_DAYS)],
      }).catch(() => {});
    }

    return true;
  } catch (err) {
    if (isUniqueConstraintError(err)) return false;
    throw err;
  }
}

/** Release a failed update so Telegram can retry it after a non-2xx response. */
export async function releaseProcessedUpdate(updateId) {
  if (updateId === undefined || updateId === null) return;
  await ensureTables();
  await getClient().execute({
    sql: 'DELETE FROM processed_updates WHERE update_id = ?',
    args: [String(updateId)],
  });
}

export async function logAdminAction(adminTelegramId, action, targetType, targetId, status, details = null) {
  await ensureTables();
  await getClient().execute({
    sql: `INSERT INTO admin_actions (admin_telegram_id, action, target_type, target_id, status, details)
      VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      String(adminTelegramId),
      String(action),
      String(targetType),
      targetId != null ? String(targetId) : null,
      String(status),
      details == null ? null : JSON.stringify(details),
    ],
  });
}

export async function getAdminActions(options = {}) {
  await ensureTables();
  const safeLimit = Math.min(5000, Math.max(1, Number(options.limit) || 20));
  const where = [];
  const args = [];

  if (options.from) {
    where.push('created_at >= ?');
    args.push(String(options.from));
  }
  if (options.to) {
    where.push('created_at <= ?');
    args.push(String(options.to));
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const result = await getClient().execute({
    sql: `SELECT * FROM admin_actions ${whereSql} ORDER BY id DESC LIMIT ?`,
    args: [...args, safeLimit],
  });
  return result.rows;
}

export async function getPurchaseExports(options = {}) {
  await ensureTables();
  const safeLimit = Math.min(5000, Math.max(1, Number(options.limit) || 1000));
  const where = [];
  const args = [];

  if (options.from) {
    where.push('p.created_at >= ?');
    args.push(String(options.from));
  }
  if (options.to) {
    where.push('p.created_at <= ?');
    args.push(String(options.to));
  }
  if (options.creator_id) {
    where.push('pr.creator_id = ?');
    args.push(String(options.creator_id));
  }
  if (options.refunded === 'only') {
    where.push('p.refunded = 1');
  } else if (options.refunded === 'no') {
    where.push('p.refunded = 0');
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const result = await getClient().execute({
    sql: `SELECT p.id, p.product_id, p.buyer_telegram_id, p.stars_paid, p.creator_share, p.platform_fee,
      p.telegram_charge_id, p.refunded, p.created_at,
      pr.creator_id, pr.title AS product_title
      FROM purchases p
      LEFT JOIN products pr ON pr.id = p.product_id
      ${whereSql}
      ORDER BY p.id DESC LIMIT ?`,
    args: [...args, safeLimit],
  });
  return result.rows;
}

export async function getPurchaseByChargeId(chargeId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: 'SELECT * FROM purchases WHERE telegram_charge_id = ? LIMIT 1',
    args: [String(chargeId)],
  });
  return result.rows[0] || null;
}

export async function markPurchaseRefundedByChargeId(chargeId) {
  await ensureTables();
  const db = getClient();
  const purchaseResult = await db.execute({
    sql: `SELECT p.*, pr.creator_id
          FROM purchases p JOIN products pr ON pr.id = p.product_id
          WHERE p.telegram_charge_id = ? LIMIT 1`,
    args: [String(chargeId)],
  });
  const purchase = purchaseResult.rows[0];
  if (!purchase || Number(purchase.refunded) === 1) return false;

  const result = await db.execute({
    sql: 'UPDATE purchases SET refunded = 1 WHERE telegram_charge_id = ? AND refunded = 0',
    args: [String(chargeId)],
  });

  if (result.rowsAffected > 0) {
    await db.execute({
      sql: 'UPDATE products SET sales_count = CASE WHEN sales_count > 0 THEN sales_count - 1 ELSE 0 END WHERE id = ?',
      args: [purchase.product_id],
    });
    await applyStarsRefundAccounting(db, purchase);
    return true;
  }
  return false;
}

export async function getPayoutQueue() {
  await ensureTables();
  const db = getClient();
  const pending = await db.execute({
    sql: `WITH balance_rows AS (
        SELECT pr.creator_id, COALESCE(SUM(p.creator_share), 0) AS amount_stars, COUNT(*) AS purchase_count
        FROM purchases p JOIN products pr ON pr.id = p.product_id
        WHERE p.refunded = 0 AND p.payout_id IS NULL
          AND p.created_at <= datetime('now', '-' || ? || ' days')
        GROUP BY pr.creator_id
        UNION ALL
        SELECT creator_id, COALESCE(SUM(amount_stars), 0) AS amount_stars, 0 AS purchase_count
        FROM creator_adjustments WHERE payout_id IS NULL GROUP BY creator_id
      )
      SELECT creator_id, SUM(amount_stars) AS amount_stars, SUM(purchase_count) AS purchase_count
      FROM balance_rows GROUP BY creator_id
      HAVING SUM(amount_stars) >= ?
      ORDER BY amount_stars DESC`,
    args: [String(PAYOUT_HOLD_DAYS), MIN_PAYOUT_STARS],
  });

  const payouts = await db.execute({
    sql: `SELECT id, creator_id, amount_stars, eur_per_star, amount_eur_cents, status, created_at, paid_at,
                 invoice_ref, invoice_url, invoice_notes, invoice_submitted_at
      FROM payouts
      ORDER BY id DESC
      LIMIT 200`,
    args: [],
  });

  return { pending: pending.rows, payouts: payouts.rows };
}

export async function createPayoutsFromUnassigned(creatorId = null) {
  await ensureTables();
  const db = getClient();

  const creatorsRes = await db.execute({
    sql: `WITH balance_rows AS (
        SELECT pr.creator_id, COALESCE(SUM(p.creator_share), 0) AS amount_stars
        FROM purchases p JOIN products pr ON pr.id = p.product_id
        WHERE p.refunded = 0 AND p.payout_id IS NULL
          AND p.created_at <= datetime('now', '-' || ? || ' days')
          ${creatorId ? 'AND pr.creator_id = ?' : ''}
        GROUP BY pr.creator_id
        UNION ALL
        SELECT creator_id, COALESCE(SUM(amount_stars), 0) AS amount_stars
        FROM creator_adjustments WHERE payout_id IS NULL
          ${creatorId ? 'AND creator_id = ?' : ''}
        GROUP BY creator_id
      )
      SELECT creator_id, SUM(amount_stars) AS amount_stars
      FROM balance_rows GROUP BY creator_id
      HAVING SUM(amount_stars) >= ?`,
    args: creatorId
      ? [String(PAYOUT_HOLD_DAYS), String(creatorId), String(creatorId), MIN_PAYOUT_STARS]
      : [String(PAYOUT_HOLD_DAYS), MIN_PAYOUT_STARS],
  });

  const created = [];
  for (const row of creatorsRes.rows) {
    const tx = await db.transaction('write');
    try {
      const ins = await tx.execute({
        sql: `INSERT INTO payouts (creator_id, amount_stars, eur_per_star, amount_eur_cents, status)
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          String(row.creator_id),
          Number(row.amount_stars),
          PAYOUT_EUR_PER_STAR,
          Math.round(Number(row.amount_stars) * PAYOUT_EUR_PER_STAR * 100),
          'pending',
        ],
      });
      const payoutId = Number(ins.lastInsertRowid);
      const assigned = await tx.execute({
        sql: `UPDATE purchases
          SET payout_id = ?
          WHERE refunded = 0 AND payout_id IS NULL
            AND created_at <= datetime('now', '-' || ? || ' days')
            AND product_id IN (SELECT id FROM products WHERE creator_id = ?)`,
        args: [payoutId, String(PAYOUT_HOLD_DAYS), String(row.creator_id)],
      });
      const assignedAdjustments = await tx.execute({
        sql: 'UPDATE creator_adjustments SET payout_id = ? WHERE creator_id = ? AND payout_id IS NULL',
        args: [payoutId, String(row.creator_id)],
      });
      // Guard against race condition: if no purchases were assigned (concurrent request already claimed them), delete the phantom payout
      if (assigned.rowsAffected === 0 && assignedAdjustments.rowsAffected === 0) {
        await tx.execute({ sql: 'DELETE FROM payouts WHERE id = ?', args: [payoutId] });
        await tx.commit();
        continue;
      }
      // Update payout amount to reflect actual assigned purchases (may differ from pre-read)
      const actualSum = await tx.execute({
        sql: `SELECT
          COALESCE((SELECT SUM(creator_share) FROM purchases WHERE payout_id = ?), 0) +
          COALESCE((SELECT SUM(amount_stars) FROM creator_adjustments WHERE payout_id = ?), 0) AS total`,
        args: [payoutId, payoutId],
      });
      const actualAmount = Number(actualSum.rows[0]?.total || 0);
      if (actualAmount < MIN_PAYOUT_STARS) {
        await tx.execute({ sql: 'UPDATE purchases SET payout_id = NULL WHERE payout_id = ?', args: [payoutId] });
        await tx.execute({ sql: 'UPDATE creator_adjustments SET payout_id = NULL WHERE payout_id = ?', args: [payoutId] });
        await tx.execute({ sql: 'DELETE FROM payouts WHERE id = ?', args: [payoutId] });
        await tx.commit();
        continue;
      }
      if (actualAmount !== Number(row.amount_stars)) {
        await tx.execute({
          sql: 'UPDATE payouts SET amount_stars = ?, amount_eur_cents = ? WHERE id = ?',
          args: [actualAmount, Math.round(actualAmount * PAYOUT_EUR_PER_STAR * 100), payoutId],
        });
      }
      await tx.commit();
      created.push({ payout_id: payoutId, creator_id: String(row.creator_id), amount_stars: actualAmount });
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  return created;
}

export async function markPayoutPaid(payoutId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `UPDATE payouts SET status = 'paid', paid_at = datetime('now')
      WHERE id = ? AND status IN ('pending','invoice_submitted','processing')`,
    args: [Number(payoutId)],
  });
  return result.rowsAffected > 0;
}

export async function markPayoutProcessing(payoutId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `UPDATE payouts SET status = 'processing'
      WHERE id = ? AND status IN ('invoice_submitted','pending')`,
    args: [Number(payoutId)],
  });
  return result.rowsAffected > 0;
}

export async function submitCreatorPayoutInvoice(creatorId, payoutId, invoiceRef, invoiceUrl = null, invoiceNotes = null) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `UPDATE payouts
          SET status = 'invoice_submitted',
              invoice_ref = ?,
              invoice_url = ?,
              invoice_notes = ?,
              invoice_submitted_at = datetime('now')
          WHERE id = ? AND creator_id = ? AND status = 'pending'`,
    args: [
      String(invoiceRef || '').trim(),
      invoiceUrl ? String(invoiceUrl).trim() : null,
      invoiceNotes ? String(invoiceNotes).trim() : null,
      Number(payoutId),
      String(creatorId),
    ],
  });
  return result.rowsAffected > 0;
}

export async function getPayoutDetails(payoutId) {
  await ensureTables();
  const db = getClient();
  const payout = await db.execute({
    sql: `SELECT id, creator_id, amount_stars, eur_per_star, amount_eur_cents, status, created_at, paid_at,
                 invoice_ref, invoice_url, invoice_notes, invoice_submitted_at
          FROM payouts WHERE id = ? LIMIT 1`,
    args: [Number(payoutId)],
  });
  const header = payout.rows[0] || null;
  if (!header) return null;

  const purchases = await db.execute({
    sql: `SELECT p.id, p.product_id, p.buyer_telegram_id, p.stars_paid, p.creator_share, p.platform_fee,
      p.telegram_charge_id, p.refunded, p.created_at, pr.title AS product_title
      FROM purchases p
      LEFT JOIN products pr ON pr.id = p.product_id
      WHERE p.payout_id = ?
      ORDER BY p.id ASC`,
    args: [Number(payoutId)],
  });

  const adjustments = await db.execute({
    sql: `SELECT id, purchase_id, amount_stars, reason, created_at
          FROM creator_adjustments WHERE payout_id = ? ORDER BY id ASC`,
    args: [Number(payoutId)],
  });

  const purchaseRows = purchases.rows.map((row) => (
    Number(row.refunded) === 1 && header.status !== 'paid'
      ? { ...row, creator_share: 0, product_title: `${row.product_title || row.product_id} (refunded)` }
      : row
  ));
  const adjustmentRows = adjustments.rows.map((row) => ({
    id: `adjustment-${row.id}`,
    product_id: '',
    buyer_telegram_id: '',
    stars_paid: 0,
    creator_share: Number(row.amount_stars),
    platform_fee: 0,
    telegram_charge_id: '',
    refunded: 0,
    created_at: row.created_at,
    product_title: row.reason === 'refund_after_payout' ? `Refund adjustment for purchase ${row.purchase_id}` : 'Balance adjustment',
  }));

  return { payout: header, purchases: [...purchaseRows, ...adjustmentRows] };
}

export async function getCreatorPayoutDetails(creatorId, payoutId) {
  await ensureTables();
  const details = await getPayoutDetails(payoutId);
  if (!details?.payout) return null;
  if (String(details.payout.creator_id) !== String(creatorId)) return null;
  return details;
}

export async function getMonthlyReconciliation(options = {}) {
  await ensureTables();
  const db = getClient();
  const from = String(options.from || '').trim();
  const to = String(options.to || '').trim();

  const where = [];
  const args = [];
  if (from) { where.push('p.created_at >= ?'); args.push(from); }
  if (to) { where.push('p.created_at <= ?'); args.push(to); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const result = await db.execute({
    sql: `SELECT strftime('%Y-%m', p.created_at) AS month,
      pr.creator_id,
      COUNT(*) AS purchases,
      SUM(CASE WHEN p.refunded = 0 THEN 1 ELSE 0 END) AS non_refunded_purchases,
      COALESCE(SUM(p.stars_paid),0) AS gross_stars,
      COALESCE(SUM(CASE WHEN p.refunded = 0 THEN p.creator_share ELSE 0 END),0) AS creator_share_net,
      COALESCE(SUM(CASE WHEN p.refunded = 0 THEN p.platform_fee ELSE 0 END),0) AS platform_fee_net,
      COALESCE(SUM(CASE WHEN p.refunded = 1 THEN p.stars_paid ELSE 0 END),0) AS refunded_stars,
      COALESCE(SUM(CASE WHEN p.payout_id IS NOT NULL THEN p.creator_share ELSE 0 END),0) AS allocated_to_payouts
      FROM purchases p
      LEFT JOIN products pr ON pr.id = p.product_id
      ${whereSql}
      GROUP BY month, pr.creator_id
      ORDER BY month DESC, creator_share_net DESC`,
    args,
  });

  return result.rows;
}

// Buyer purchase history
export async function getBuyerPurchases(buyerTelegramId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `SELECT p.product_id, pr.title, pr.content_type, pr.description, pr.price_stars, pr.active,
                 p.stars_paid, p.created_at AS purchased_at, 'stars' AS payment_method,
                 NULL AS currency, NULL AS amount_cents
          FROM purchases p
          JOIN products pr ON pr.id = p.product_id
          WHERE p.buyer_telegram_id = ? AND p.refunded = 0
          UNION ALL
          SELECT fp.product_id, pr.title, pr.content_type, pr.description, pr.price_stars, pr.active,
                 NULL AS stars_paid, fp.created_at AS purchased_at, 'stripe' AS payment_method,
                 fp.currency, fp.amount_cents
          FROM fiat_purchases fp
          JOIN products pr ON pr.id = fp.product_id
          WHERE fp.buyer_telegram_id = ? AND fp.refunded = 0
          ORDER BY purchased_at DESC`,
    args: [String(buyerTelegramId), String(buyerTelegramId)],
  });
  return result.rows;
}

// Delivery queue operations
export async function enqueueDelivery(productId, buyerTelegramId, purchaseType = 'stars') {
  await ensureTables();
  // Prevent duplicate enqueues for the same buyer+product (ignore if already queued)
  await getClient().execute({
    sql: `INSERT INTO delivery_queue (product_id, buyer_telegram_id, purchase_type)
          SELECT ?, ?, ?
          WHERE NOT EXISTS (
            SELECT 1 FROM delivery_queue
            WHERE product_id = ? AND buyer_telegram_id = ? AND status = 'pending'
          )`,
    args: [productId, String(buyerTelegramId), purchaseType, productId, String(buyerTelegramId)],
  });
}

export async function getPendingDeliveries(limit = 10) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `SELECT * FROM delivery_queue
          WHERE status = 'pending' AND next_retry_at <= datetime('now') AND attempts < max_attempts
          ORDER BY next_retry_at ASC LIMIT ?`,
    args: [limit],
  });
  return result.rows;
}

export async function markDeliveryDone(deliveryId) {
  await ensureTables();
  await getClient().execute({
    sql: `UPDATE delivery_queue SET status = 'done' WHERE id = ?`,
    args: [Number(deliveryId)],
  });
}

/**
 * Mark any pending queued delivery for a (product, buyer) as done. Used when a
 * synchronous delivery succeeds after the row was enqueued as a durable intent,
 * so the retry cron does not re-deliver it.
 */
export async function markDeliveryDoneForTarget(productId, buyerTelegramId) {
  await ensureTables();
  await getClient().execute({
    sql: `UPDATE delivery_queue SET status = 'done' WHERE product_id = ? AND buyer_telegram_id = ? AND status = 'pending'`,
    args: [productId, String(buyerTelegramId)],
  });
}

export async function markDeliveryFailed(deliveryId, errorMessage) {
  await ensureTables();
  const db = getClient();
  // Exponential backoff: 1min, 5min, 15min
  const row = await db.execute({ sql: 'SELECT attempts FROM delivery_queue WHERE id = ?', args: [Number(deliveryId)] });
  const attempts = Number(row.rows[0]?.attempts || 0) + 1;
  const backoffMinutes = [1, 5, 15][Math.min(attempts - 1, 2)];

  await db.execute({
    sql: `UPDATE delivery_queue SET
            attempts = ?,
            last_error = ?,
            next_retry_at = datetime('now', '+' || ? || ' minutes'),
            status = CASE WHEN ? >= max_attempts THEN 'failed' ELSE 'pending' END
          WHERE id = ?`,
    args: [attempts, String(errorMessage || '').slice(0, 500), backoffMinutes, attempts, Number(deliveryId)],
  });
}

export async function getFailedDeliveries(limit = 50) {
  await ensureTables();
  const result = await getClient().execute({
    sql: `SELECT dq.*, p.title AS product_title
          FROM delivery_queue dq
          LEFT JOIN products p ON p.id = dq.product_id
          WHERE dq.status = 'failed'
          ORDER BY dq.created_at DESC LIMIT ?`,
    args: [limit],
  });
  return result.rows;
}
