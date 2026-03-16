import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import { BOT_TOKEN, WEBHOOK_SECRET, INIT_DATA_MAX_AGE_SECONDS, MIN_PRICE_STARS, MAX_PRICE_STARS, MAX_TITLE_LENGTH, MAX_CONTENT_LENGTH } from './config.js';

/**
 * Validate Telegram initData using HMAC-SHA256.
 * Returns the parsed data if valid, null otherwise.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */

const MAX_AUTH_DATE_FUTURE_SKEW_SECONDS = 30;

export function validateInitDataDetailed(initData) {
  if (!initData || !BOT_TOKEN) return { ok: false, error: 'MISSING_INITDATA' };

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, error: 'MISSING_HASH' };

  // Check auth_date is present and not expired (prevents replay attacks)
  const authDate = Number.parseInt(params.get('auth_date') || '', 10);
  if (!Number.isFinite(authDate) || authDate <= 0) return { ok: false, error: 'INVALID_AUTH_DATE' };
  const now = Math.floor(Date.now() / 1000);
  if (authDate - now > MAX_AUTH_DATE_FUTURE_SKEW_SECONDS) return { ok: false, error: 'INVALID_AUTH_DATE' };
  if (now - authDate > INIT_DATA_MAX_AGE_SECONDS) return { ok: false, error: 'INITDATA_EXPIRED' };

  params.delete('hash');
  const pairs = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const computedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (!/^[a-f0-9]{64}$/i.test(String(hash))) return { ok: false, error: 'INVALID_HASH' };

  const computed = Buffer.from(computedHash, 'hex');
  const provided = Buffer.from(String(hash), 'hex');
  if (computed.length !== provided.length) return { ok: false, error: 'INVALID_HASH' };
  if (!timingSafeEqual(computed, provided)) return { ok: false, error: 'INVALID_HASH' };

  // Parse user object if present
  const result = Object.fromEntries(params.entries());
  if (result.user) {
    try { result.user = JSON.parse(result.user); } catch { return { ok: false, error: 'INVALID_USER' }; }
  }
  return { ok: true, data: result };
}

export function validateInitData(initData) {
  const checked = validateInitDataDetailed(initData);
  return checked.ok ? checked.data : null;
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
  const s = String(value || '');
  // Accept legacy UUIDs (36 chars) and new short IDs (8 chars, alphanumeric no confusing chars)
  return /^[a-f0-9-]{36}$/i.test(s) || /^[a-z2-9]{8}$/.test(s);
}

/**
 * Generate a short, human-friendly product ID (8 chars).
 * Uses only lowercase + digits, excluding confusing chars (0, 1, o, i, l).
 */
export function generateShortId() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'; // 30 chars
  const bytes = randomBytes(8);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

export function getForwardedClientIp(forwardedForHeader) {
  if (!forwardedForHeader) return null;
  const candidate = String(forwardedForHeader).split(',')[0]?.trim();
  if (!candidate || candidate.length > 64) return null;
  return candidate;
}

export function sanitizeCreatorProfileInput(profile = {}) {
  const legalName = String(profile.legal_name || '').trim();
  const email = String(profile.email || '').trim().toLowerCase();
  const country = String(profile.country || '').trim().toUpperCase();
  const payoutMethod = String(profile.payout_method || '').trim().toLowerCase();
  const payoutDetails = String(profile.payout_details || '').trim();

  if (legalName && legalName.length > 120) {
    return { ok: false, error: 'legal_name too long (max 120 characters)' };
  }

  if (email) {
    if (email.length > 254) {
      return { ok: false, error: 'email too long (max 254 characters)' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'Invalid email format' };
    }
  }

  if (country && !/^[A-Z]{2}$/.test(country)) {
    return { ok: false, error: 'country must be a 2-letter ISO code' };
  }

  if (payoutMethod && !['bank_transfer', 'paypal', 'crypto', 'other'].includes(payoutMethod)) {
    return { ok: false, error: 'Unsupported payout_method' };
  }

  if (payoutDetails && payoutDetails.length > 2000) {
    return { ok: false, error: 'payout_details too long (max 2000 characters)' };
  }

  return {
    ok: true,
    value: {
      legal_name: legalName,
      email,
      country,
      payout_method: payoutMethod,
      payout_details: payoutDetails,
    },
  };
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
