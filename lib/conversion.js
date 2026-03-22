/**
 * Stars ↔ fiat conversion helpers.
 * Uses static rates from config. Can be replaced with live rates later.
 */

// These are duplicated from config.js for client-side use (config.js reads process.env)
const USD_PER_STAR = 0.02;
const EUR_PER_STAR = 0.0185;

export function starsToEur(stars) {
  return Number((Number(stars) * EUR_PER_STAR).toFixed(2));
}

export function formatEur(amount) {
  return `${Number(amount).toFixed(2)} EUR`;
}

/**
 * Calculate payout amount after fees.
 * @param {number} stars - Stars amount
 * @param {'bank_transfer'|'paypal'} method - Payout method
 * @returns {{ grossEur: number, feeEur: number, netEur: number, feeDescription: string }}
 */
export function calculatePayoutFees(stars, method = 'bank_transfer') {
  const grossEur = starsToEur(stars);

  if (method === 'paypal') {
    const feeEur = Number((grossEur * 0.035 + 0.35).toFixed(2));
    return {
      grossEur,
      feeEur,
      netEur: Number((grossEur - feeEur).toFixed(2)),
      feeDescription: '3.5% + 0.35 EUR (PayPal)',
    };
  }

  // bank_transfer (SEPA) — free
  return {
    grossEur,
    feeEur: 0,
    netEur: grossEur,
    feeDescription: 'Free (SEPA)',
  };
}
