import { createHmac, timingSafeEqual } from 'crypto';
import { BOT_TOKEN, WEBHOOK_SECRET, INIT_DATA_MAX_AGE_SECONDS, MIN_PRICE_STARS, MAX_PRICE_STARS, MAX_TITLE_LENGTH, MAX_CONTENT_LENGTH } from './config.js';

/**
 * Validate Telegram initData using HMAC-SHA256.
 * Returns the parsed data if valid, null otherwise.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */

const MAX_AUTH_DATE_FUTURE_SKEW_SECONDS = 30;

export function validateInitData(initData) {
  if (!initData || !BOT_TOKEN) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  // Check auth_date is present and not expired (prevents replay attacks)
  const authDate = Number.parseInt(params.get('auth_date') || '', 10);
  if (!Number.isFinite(authDate) || authDate <= 0) return null;
  const now = Math.floor(Date.now() / 1000);
  if (authDate - now > MAX_AUTH_DATE_FUTURE_SKEW_SECONDS) return null;
  if (now - authDate > INIT_DATA_MAX_AGE_SECONDS) return null;

  params.delete('hash');
  const pairs = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const computedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (!/^[a-f0-9]{64}$/i.test(String(hash))) return null;

  const computed = Buffer.from(computedHash, 'hex');
  const provided = Buffer.from(String(hash), 'hex');
  if (computed.length !== provided.length) return null;
  if (!timingSafeEqual(computed, provided)) return null;

  // Parse user object if present
  const result = Object.fromEntries(params.entries());
  if (result.user) {
    try { result.user = JSON.parse(result.user); } catch { return null; }
  }
  return result;
}

/**
 * Verify webhook request came from Telegram by checking secret token header.
 */
export function verifyWebhookSecret(req) {
  if (!WEBHOOK_SECRET) return false;
  const token = req.headers.get('x-telegram-bot-api-secret-token');
  if (!token) return false;

  const expected = Buffer.from(WEBHOOK_SECRET, 'utf8');
  const provided = Buffer.from(token, 'utf8');
  if (expected.length !== provided.length) return false;

  return timingSafeEqual(expected, provided);
}

/**
 * Escape special characters for Telegram MarkdownV2.
 */
export function escapeMarkdown(text) {
  if (!text) return '';
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

export function isValidProductId(value) {
  return /^[a-f0-9-]{36}$/i.test(String(value || ''));
}

export function parseNewCommand(text) {
  const parts = String(text || '').trim().replace(/^\/new\s+/, '');
  const match = parts.match(/^(\d+)\s+(.+?)\s*\|\s*(.+)$/s);

  if (!match) return { ok: false, error: 'format' };

  const price = Number.parseInt(match[1], 10);
  const title = match[2].replace(/[\r\n\t]+/g, ' ').trim();
  const content = match[3].trim();

  if (!Number.isFinite(price) || price < MIN_PRICE_STARS || price > MAX_PRICE_STARS) {
    return { ok: false, error: 'price' };
  }

  if (!title || title.length > MAX_TITLE_LENGTH) {
    return { ok: false, error: 'title' };
  }

  if (!content || content.length > MAX_CONTENT_LENGTH) {
    return { ok: false, error: 'content' };
  }

  return { ok: true, value: { price, title, content } };
}
