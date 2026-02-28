import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = process.env.DB_PATH || join(process.cwd(), 'data', 'paywall.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Create tables
    db.exec(`
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
        telegram_charge_id TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS payouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creator_id TEXT NOT NULL,
        amount_stars INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }
  return db;
}

// Creator operations
export function getOrCreateCreator(telegramId, username, displayName) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM creators WHERE telegram_id = ?').get(telegramId);
  if (existing) return existing;
  
  db.prepare('INSERT INTO creators (telegram_id, username, display_name) VALUES (?, ?, ?)').run(telegramId, username, displayName);
  return db.prepare('SELECT * FROM creators WHERE telegram_id = ?').get(telegramId);
}

// Product operations
export function createProduct(id, creatorId, title, description, priceStars, contentType, content, fileId) {
  const db = getDb();
  db.prepare(`INSERT INTO products (id, creator_id, title, description, price_stars, content_type, content, file_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(id, creatorId, title, description, priceStars, contentType, content, fileId);
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

export function getProduct(id) {
  return getDb().prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(id);
}

export function getCreatorProducts(creatorId) {
  return getDb().prepare('SELECT * FROM products WHERE creator_id = ? ORDER BY created_at DESC').all(creatorId);
}

export function getCreatorStats(creatorId) {
  const db = getDb();
  const products = db.prepare('SELECT COUNT(*) as count FROM products WHERE creator_id = ?').get(creatorId);
  const sales = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(creator_share), 0) as total_stars FROM purchases WHERE product_id IN (SELECT id FROM products WHERE creator_id = ?)').get(creatorId);
  return { products: products.count, sales: sales.count, totalStars: sales.total_stars };
}

// Purchase operations
export function recordPurchase(productId, buyerTelegramId, starsPaid, creatorShare, platformFee, chargeId) {
  const db = getDb();
  db.prepare(`INSERT INTO purchases (product_id, buyer_telegram_id, stars_paid, creator_share, platform_fee, telegram_charge_id) 
    VALUES (?, ?, ?, ?, ?, ?)`).run(productId, buyerTelegramId, starsPaid, creatorShare, platformFee, chargeId);
  db.prepare('UPDATE products SET sales_count = sales_count + 1 WHERE id = ?').run(productId);
}

export function hasPurchased(productId, buyerTelegramId) {
  return !!getDb().prepare('SELECT 1 FROM purchases WHERE product_id = ? AND buyer_telegram_id = ?').get(productId, buyerTelegramId);
}
