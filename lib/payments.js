import { PLATFORM_FEE_PERCENT } from './config.js';

/** Calculate a whole-Star platform fee without ever exceeding the advertised rate. */
export function calculatePlatformFee(stars, percent = PLATFORM_FEE_PERCENT) {
  const amount = Number(stars);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.max(0, Math.floor(amount * Number(percent) / 100));
}

export function isProductReady(product) {
  if (!product) return false;
  if (product.content_type !== 'file') return true;
  return Boolean(String(product.file_id || '').trim());
}
