import { createClient } from '@libsql/client';
import { CREATOR_TERMS_VERSION, PROCESSED_UPDATES_CLEANUP_RATE, PROCESSED_UPDATES_TTL_DAYS } from './config.js';

const isUniqueConstraintError = (err) => err?.message?.includes('UNIQUE constraint');

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

let initialized = false;

async function ensureTables() {
  if (initialized) return;
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
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id),
      UNIQUE(product_id, buyer_telegram_id)
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
      UNIQUE(product_id, buyer_telegram_id, currency)
    );

    CREATE TABLE IF NOT EXISTS payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id TEXT NOT NULL,
      amount_stars INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
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
      creator_id TEXT PRIMARY KEY,
      terms_version TEXT NOT NULL,
      accepted_at TEXT DEFAULT (datetime('now')),
      accepted_ip TEXT,
      user_agent TEXT
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
    "ALTER TABLE products ADD COLUMN payment_methods TEXT DEFAULT 'stars,stripe'",
    "ALTER TABLE products ADD COLUMN file_kind TEXT DEFAULT 'document'",
    "ALTER TABLE purchases ADD COLUMN refunded INTEGER DEFAULT 0",
    "ALTER TABLE purchases ADD COLUMN payout_id INTEGER",
    "ALTER TABLE payouts ADD COLUMN paid_at TEXT",
    "ALTER TABLE payouts ADD COLUMN invoice_ref TEXT",
    "ALTER TABLE payouts ADD COLUMN invoice_url TEXT",
    "ALTER TABLE payouts ADD COLUMN invoice_notes TEXT",
    "ALTER TABLE payouts ADD COLUMN invoice_submitted_at TEXT",
  ];
  for (const sql of migrations) {
    try { await db.execute(sql); } catch { /* column already exists */ }
  }

  initialized = true;
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

export async function getCreatorTermsAcceptance(creatorId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: 'SELECT creator_id, terms_version, accepted_at FROM creator_terms_acceptance WHERE creator_id = ? LIMIT 1',
    args: [String(creatorId)],
  });
  return result.rows[0] || null;
}

export async function acceptCreatorTerms(creatorId, acceptedIp = null, userAgent = null) {
  await ensureTables();
  await getClient().execute({
    sql: `INSERT INTO creator_terms_acceptance (creator_id, terms_version, accepted_ip, user_agent)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(creator_id) DO UPDATE SET
        terms_version = excluded.terms_version,
        accepted_at = datetime('now'),
        accepted_ip = excluded.accepted_ip,
        user_agent = excluded.user_agent`,
    args: [String(creatorId), CREATOR_TERMS_VERSION, acceptedIp, userAgent],
  });
  return getCreatorTermsAcceptance(creatorId);
}

export async function hasAcceptedCurrentCreatorTerms(creatorId) {
  const acceptance = await getCreatorTermsAcceptance(creatorId);
  return Boolean(acceptance && acceptance.terms_version === CREATOR_TERMS_VERSION);
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
    sql: `SELECT id, amount_stars, status, created_at, paid_at,
                 invoice_ref, invoice_url, invoice_notes, invoice_submitted_at
          FROM payouts
          WHERE creator_id = ?
          ORDER BY id DESC
          LIMIT 12`,
    args: [String(creatorId)],
  });

  return {
    totals: {
      sales_count: Number(stars.rows[0]?.sales_count || 0),
      gross_stars: Number(stars.rows[0]?.gross_stars || 0),
      fee_stars: Number(stars.rows[0]?.fee_stars || 0),
      net_stars: Number(stars.rows[0]?.net_stars || 0),
      pending_stars: Number(pending.rows[0]?.pending_stars || 0),
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
  paymentMethods = 'stars,stripe',
) {
  await ensureTables();
  const db = getClient();
  await db.execute({
    sql: `INSERT INTO products (id, creator_id, title, description, price_stars, content_type, content, file_id, file_kind, price_usd_cents, price_eur_cents, payment_methods)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, creatorId, title, description, priceStars, contentType, content, fileId, fileKind, priceUsdCents, priceEurCents, paymentMethods],
  });
  const result = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
  return result.rows[0];
}

export async function getProduct(id) {
  await ensureTables();
  const result = await getClient().execute({ sql: 'SELECT * FROM products WHERE id = ? AND active = 1', args: [id] });
  return result.rows[0] || null;
}

export async function getCreatorProducts(creatorId, includeInactive = false) {
  await ensureTables();
  const sql = includeInactive
    ? 'SELECT * FROM products WHERE creator_id = ? ORDER BY created_at DESC'
    : 'SELECT * FROM products WHERE creator_id = ? AND active = 1 ORDER BY created_at DESC';
  const result = await getClient().execute({ sql, args: [creatorId] });
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
export async function recordPurchase(productId, buyerTelegramId, starsPaid, creatorShare, platformFee, chargeId) {
  await ensureTables();
  const db = getClient();
  await db.execute({
    sql: `INSERT INTO purchases (product_id, buyer_telegram_id, stars_paid, creator_share, platform_fee, telegram_charge_id) 
      VALUES (?, ?, ?, ?, ?, ?)`,
    args: [productId, buyerTelegramId, starsPaid, creatorShare, platformFee, chargeId],
  });
  await db.execute({ sql: 'UPDATE products SET sales_count = sales_count + 1 WHERE id = ?', args: [productId] });
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
  await db.execute({
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
  await db.execute({ sql: 'UPDATE products SET sales_count = sales_count + 1 WHERE id = ?', args: [productId] });
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

// Soft-delete a product (sets active = 0)
export async function softDeleteProduct(productId, creatorId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: 'UPDATE products SET active = 0 WHERE id = ? AND creator_id = ?',
    args: [productId, creatorId],
  });
  return result.rowsAffected > 0;
}

export async function setProductActive(productId, active) {
  await ensureTables();
  const result = await getClient().execute({
    sql: 'UPDATE products SET active = ? WHERE id = ?',
    args: [active ? 1 : 0, productId],
  });
  return result.rowsAffected > 0;
}

// Update product fields (title, description, price)
export async function updateProduct(productId, creatorId, updates) {
  await ensureTables();
  const fields = [];
  const args = [];
  if (updates.title !== undefined) { fields.push('title = ?'); args.push(updates.title); }
  if (updates.description !== undefined) { fields.push('description = ?'); args.push(updates.description); }
  if (updates.price_stars !== undefined) { fields.push('price_stars = ?'); args.push(updates.price_stars); }
  if (fields.length === 0) return null;
  args.push(productId, creatorId);
  await getClient().execute({
    sql: `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND creator_id = ? AND active = 1`,
    args,
  });
  return getProduct(productId);
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
    sql: 'UPDATE products SET file_id = ?, file_kind = ? WHERE id = ? AND content_type = \'file\'',
    args: [fileId, fileKind, productId],
  });
  return result.rowsAffected > 0;
}

// Mark a purchase as refunded
export async function markPurchaseRefunded(productId, buyerTelegramId) {
  await ensureTables();
  const db = getClient();
  const result = await db.execute({
    sql: 'UPDATE purchases SET refunded = 1 WHERE product_id = ? AND buyer_telegram_id = ? AND refunded = 0',
    args: [productId, buyerTelegramId],
  });

  if (result.rowsAffected > 0) {
    await db.execute({
      sql: 'UPDATE products SET sales_count = CASE WHEN sales_count > 0 THEN sales_count - 1 ELSE 0 END WHERE id = ?',
      args: [productId],
    });
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
  const purchase = await getPurchaseByChargeId(chargeId);
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
    return true;
  }
  return false;
}

export async function getPayoutQueue() {
  await ensureTables();
  const db = getClient();
  const pending = await db.execute({
    sql: `SELECT pr.creator_id, COALESCE(SUM(p.creator_share),0) AS amount_stars, COUNT(*) AS purchase_count
      FROM purchases p
      JOIN products pr ON pr.id = p.product_id
      WHERE p.refunded = 0 AND p.payout_id IS NULL
      GROUP BY pr.creator_id
      HAVING amount_stars > 0
      ORDER BY amount_stars DESC`,
    args: [],
  });

  const payouts = await db.execute({
    sql: `SELECT id, creator_id, amount_stars, status, created_at, paid_at,
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
    sql: `SELECT pr.creator_id, COALESCE(SUM(p.creator_share),0) AS amount_stars
      FROM purchases p
      JOIN products pr ON pr.id = p.product_id
      WHERE p.refunded = 0 AND p.payout_id IS NULL ${creatorId ? 'AND pr.creator_id = ?' : ''}
      GROUP BY pr.creator_id
      HAVING amount_stars > 0`,
    args: creatorId ? [String(creatorId)] : [],
  });

  const created = [];
  for (const row of creatorsRes.rows) {
    await db.execute('BEGIN');
    try {
      const ins = await db.execute({
        sql: 'INSERT INTO payouts (creator_id, amount_stars, status) VALUES (?, ?, ?)',
        args: [String(row.creator_id), Number(row.amount_stars), 'pending'],
      });
      const payoutId = Number(ins.lastInsertRowid);
      await db.execute({
        sql: `UPDATE purchases
          SET payout_id = ?
          WHERE refunded = 0 AND payout_id IS NULL
            AND product_id IN (SELECT id FROM products WHERE creator_id = ?)`,
        args: [payoutId, String(row.creator_id)],
      });
      await db.execute('COMMIT');
      created.push({ payout_id: payoutId, creator_id: String(row.creator_id), amount_stars: Number(row.amount_stars) });
    } catch (err) {
      await db.execute('ROLLBACK');
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
    sql: `SELECT id, creator_id, amount_stars, status, created_at, paid_at,
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

  return { payout: header, purchases: purchases.rows };
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
  await getClient().execute({
    sql: `INSERT INTO delivery_queue (product_id, buyer_telegram_id, purchase_type)
          VALUES (?, ?, ?)`,
    args: [productId, String(buyerTelegramId), purchaseType],
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
