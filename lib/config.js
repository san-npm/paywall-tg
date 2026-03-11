export const BOT_TOKEN = process.env.BOT_TOKEN;
export const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
export const WEBAPP_URL = process.env.WEBAPP_URL || 'https://paywall-tg.vercel.app';
export const PLATFORM_FEE_PERCENT = 5; // keep fee consistent across app and website
export const MIN_PRICE_STARS = 1;
export const MAX_PRICE_STARS = 50000;
export const MAX_TITLE_LENGTH = 140;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_CONTENT_LENGTH = 10000;
export const TELEGRAM_CURRENCY = 'XTR';

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
