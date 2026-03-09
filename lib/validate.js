import { createHmac, timingSafeEqual } from 'crypto';
import { BOT_TOKEN, WEBHOOK_SECRET, INIT_DATA_MAX_AGE_SECONDS } from './config.js';

/**
 * Validate Telegram initData using HMAC-SHA256.
 * Returns the parsed data if valid, null otherwise.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */

export function validateInitData(initData) {
  if (!initData || !BOT_TOKEN) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  // Check auth_date is present and not expired (prevents replay attacks)
  const authDate = parseInt(params.get('auth_date'));
  if (!authDate || isNaN(authDate)) return null;
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > INIT_DATA_MAX_AGE_SECONDS) return null;

  params.delete('hash');
  const pairs = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const computedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

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
  return token === WEBHOOK_SECRET;
}

/**
 * Escape special characters for Telegram MarkdownV2.
 */
export function escapeMarkdown(text) {
  if (!text) return '';
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}
