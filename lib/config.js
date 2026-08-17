export const BOT_TOKEN = process.env.BOT_TOKEN;
export const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
export const WEBAPP_URL = process.env.WEBAPP_URL || 'https://gategram.app';
export const PLATFORM_FEE_PERCENT = 5; // keep fee consistent across app and website
// Whole-Star fees cannot represent 5% below 20 Stars. Enforce a floor and round
// the fee down so the effective fee never exceeds the advertised percentage.
export const MIN_PRICE_STARS = 20;
export const MAX_PRICE_STARS = 10000;
export const MAX_TITLE_LENGTH = 140;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_CONTENT_LENGTH = 10000;
export const TELEGRAM_CURRENCY = 'XTR';
export const CREATOR_TERMS_VERSION = process.env.CREATOR_TERMS_VERSION || 'v2-2026-08-17';
export const CREATOR_TERMS_URL = process.env.CREATOR_TERMS_URL || 'https://gategram.app/docs/creator-terms';
export const BUYER_TERMS_VERSION = process.env.BUYER_TERMS_VERSION || 'v2-2026-08-17';

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
export const STRIPE_WEBHOOK_SECRET_ALT = process.env.STRIPE_WEBHOOK_SECRET_ALT || '';
const parsedStripeLegacyCutoff = Number.parseInt(process.env.STRIPE_LEGACY_CUTOFF_UNIX || '1787011200', 10);
export const STRIPE_LEGACY_CUTOFF_UNIX = Number.isFinite(parsedStripeLegacyCutoff)
  ? parsedStripeLegacyCutoff
  : 1787011200;
// Creator fiat payouts must be based on the bot developer reward, not the
// consumer acquisition price of a Star. This conservative, operator-controlled
// rate is locked into payout records when they are created.
const parsedPayoutEurPerStar = Number.parseFloat(process.env.PAYOUT_EUR_PER_STAR || '0.0100');
export const PAYOUT_EUR_PER_STAR = Number.isFinite(parsedPayoutEurPerStar) && parsedPayoutEurPerStar > 0 && parsedPayoutEurPerStar <= 0.02
  ? parsedPayoutEurPerStar
  : 0.0100;
const parsedPayoutHoldDays = Number.parseInt(process.env.PAYOUT_HOLD_DAYS || '21', 10);
export const PAYOUT_HOLD_DAYS = Number.isFinite(parsedPayoutHoldDays) ? Math.max(21, parsedPayoutHoldDays) : 21;
const configuredBotUsername = String(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
export const NEXT_PUBLIC_TELEGRAM_BOT_USERNAME = /^[A-Za-z0-9_]{5,32}$/.test(configuredBotUsername)
  ? configuredBotUsername
  : '';
export const ENABLE_FAKE_PAYMENTS = String(process.env.ENABLE_FAKE_PAYMENTS || 'false').toLowerCase() === 'true';
if (ENABLE_FAKE_PAYMENTS && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: ENABLE_FAKE_PAYMENTS=true in production is forbidden. Any user could acquire products for free.');
}

const parsedInitDataMaxAge = Number.parseInt(process.env.INIT_DATA_MAX_AGE_SECONDS || '900', 10);
export const INIT_DATA_MAX_AGE_SECONDS = Number.isFinite(parsedInitDataMaxAge) && parsedInitDataMaxAge > 0
  ? parsedInitDataMaxAge
  : 900;

export const ADMIN_TELEGRAM_IDS = new Set(
  String(process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
);

const parsedProcessedUpdatesTtlDays = Number.parseInt(process.env.PROCESSED_UPDATES_TTL_DAYS || '3', 10);
export const PROCESSED_UPDATES_TTL_DAYS = Number.isFinite(parsedProcessedUpdatesTtlDays) && parsedProcessedUpdatesTtlDays > 0
  ? parsedProcessedUpdatesTtlDays
  : 3;

const parsedProcessedUpdatesCleanupRate = Number.parseFloat(process.env.PROCESSED_UPDATES_CLEANUP_RATE || '0.05');
export const PROCESSED_UPDATES_CLEANUP_RATE = Number.isFinite(parsedProcessedUpdatesCleanupRate)
  ? Math.min(1, Math.max(0, parsedProcessedUpdatesCleanupRate))
  : 0.05;
