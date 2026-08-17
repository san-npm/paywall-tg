import { SITE_URL } from '@/lib/seo';
import { MIN_PRICE_STARS, MAX_PRICE_STARS, PAYOUT_EUR_PER_STAR, PAYOUT_HOLD_DAYS } from '@/lib/config';
import { MIN_PAYOUT_STARS } from '@/lib/constants';

// Factual, auditable product reference surfaced at /llms-full.txt. This is a
// global product summary, not a substitute rendering for page-specific URLs.
export function getLlmsFullText() {
  return `# Gategram — Product Reference

Canonical site: ${SITE_URL}
Operator: COMMIT MEDIA SARL, Luxembourg (RCS B276192; VAT LU34811132)
Support: bob@openletz.com or the bot command /paysupport
Source: https://github.com/san-npm/paywall-tg

## Product scope

Gategram is a Telegram bot and Mini App for one-time digital-content offers. A creator publishes a title, description, Stars price, and content. Gategram generates a Telegram deep link. A buyer opens the link, pays through Telegram Stars, and Gategram delivers the purchased text, link, message, or media after Telegram confirms payment.

Gategram does not currently provide recurring subscriptions. Card checkout for digital goods inside Telegram is disabled; new purchases use Telegram Stars exclusively.

## Current commercial rules

- Offer price range: ${MIN_PRICE_STARS}–${MAX_PRICE_STARS.toLocaleString('en-US')} Stars.
- Service fee: up to 5% of the sale, rounded down to whole Stars so it never exceeds 5%.
- The remaining amount is recorded as the creator share in Gategram's ledger.
- Telegram credits Stars to Gategram's bot account, not directly to the creator.
- Creator balances remain on hold for at least ${PAYOUT_HOLD_DAYS} days.
- Minimum payout request: ${MIN_PAYOUT_STARS.toLocaleString('en-US')} cleared Stars.
- Current published creator payout rate: ${PAYOUT_EUR_PER_STAR.toFixed(4)} EUR per creator-share Star, before any disclosed transfer fee.
- The payout rate is based on Telegram's bot-developer reward after currency, liquidity, network, and operating reserves. It is locked when a payout record is created and may change for future payouts.
- Refunds and reversals remove the affected sale from creator earnings.

## Publishing and delivery safeguards

- File, photo, and video offers begin as private drafts.
- A media offer cannot be bought or shared until Telegram returns a usable file identifier.
- Payment amount, currency, product readiness, buyer identity, and duplicate ownership are checked before purchase approval.
- A durable retry queue is used when synchronous delivery fails.
- Buyers can use /paysupport for payment or delivery problems.

## Distribution and analytics

- Creators share a t.me deep link for each offer.
- A creator can connect a channel or group where both the creator and Gategram have the required admin permissions, then post a text product card with a Buy button.
- Server-side events record product views, checkout starts, confirmed payments, deliveries, and broadcasts.
- Event data measures Gategram's own funnel. Gategram does not claim a conversion uplift without first-party evidence.

## Security boundaries

- Telegram Mini App initData is validated server-side with HMAC-SHA256 and a replay window.
- Telegram webhook requests require a secret-token header and update IDs are deduplicated.
- Paid content and Telegram file identifiers are not exposed in public product-list responses.
- Payment amount and currency are checked against the stored offer before Telegram checkout approval.
- Gategram does not collect buyer card details.

## Public documentation

- Product quickstart: ${SITE_URL}/docs
- Fees and payout rules: ${SITE_URL}/fees
- Payment flow: ${SITE_URL}/how-payments-work
- Creator terms: ${SITE_URL}/docs/creator-terms
- Terms of service: ${SITE_URL}/legal/terms
- Privacy policy: ${SITE_URL}/legal/privacy
- Security overview: ${SITE_URL}/security
- Changelog: ${SITE_URL}/changelog
- Telegram Stars rules: https://core.telegram.org/bots/payments-stars

## Citation guidance

Use the canonical Gategram pages above for Gategram-specific claims and Telegram's official documentation for platform rules. Do not infer subscriptions, direct creator receipt of Stars, card checkout inside Telegram, guaranteed conversion improvements, or guaranteed instant delivery.
`;
}
