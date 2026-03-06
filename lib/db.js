import { createClient } from '@libsql/client';

let client;

function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

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

    CREATE TABLE IF NOT EXISTS payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id TEXT NOT NULL,
      amount_stars INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migration: add columns if they don't exist (safe for existing DBs)
  const migrations = [
    "ALTER TABLE products ADD COLUMN views INTEGER DEFAULT 0",
    "ALTER TABLE purchases ADD COLUMN refunded INTEGER DEFAULT 0",
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

// Product operations
export async function createProduct(id, creatorId, title, description, priceStars, contentType, content, fileId) {
  await ensureTables();
  const db = getClient();
  await db.execute({
    sql: `INSERT INTO products (id, creator_id, title, description, price_stars, content_type, content, file_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, creatorId, title, description, priceStars, contentType, content, fileId],
  });
  const result = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
  return result.rows[0];
}

export async function getProduct(id) {
  await ensureTables();
  const result = await getClient().execute({ sql: 'SELECT * FROM products WHERE id = ? AND active = 1', args: [id] });
  return result.rows[0] || null;
}

export async function getCreatorProducts(creatorId) {
  await ensureTables();
  const result = await getClient().execute({ sql: 'SELECT * FROM products WHERE creator_id = ? ORDER BY created_at DESC', args: [creatorId] });
  return result.rows;
}

export async function getCreatorStats(creatorId) {
  await ensureTables();
  const db = getClient();
  const products = await db.execute({ sql: 'SELECT COUNT(*) as count FROM products WHERE creator_id = ?', args: [creatorId] });
  const sales = await db.execute({
    sql: 'SELECT COUNT(*) as count, COALESCE(SUM(creator_share), 0) as total_stars FROM purchases WHERE product_id IN (SELECT id FROM products WHERE creator_id = ?)',
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
  const result = await getClient().execute({
    sql: 'SELECT 1 FROM purchases WHERE product_id = ? AND buyer_telegram_id = ? AND refunded = 0',
    args: [productId, buyerTelegramId],
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

// Attach a file_id to a product
export async function attachFileToProduct(productId, fileId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: 'UPDATE products SET file_id = ? WHERE id = ? AND content_type = \'file\'',
    args: [fileId, productId],
  });
  return result.rowsAffected > 0;
}

// Mark a purchase as refunded
export async function markPurchaseRefunded(productId, buyerTelegramId) {
  await ensureTables();
  const result = await getClient().execute({
    sql: 'UPDATE purchases SET refunded = 1 WHERE product_id = ? AND buyer_telegram_id = ? AND refunded = 0',
    args: [productId, buyerTelegramId],
  });
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

// Get a product including inactive ones (for editing by owner)
export async function getProductRaw(id) {
  await ensureTables();
  const result = await getClient().execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
  return result.rows[0] || null;
}
