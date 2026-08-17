import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Bot } from 'grammy';
import {
  BOT_TOKEN,
  PLATFORM_FEE_PERCENT,
  STRIPE_LEGACY_CUTOFF_UNIX,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_WEBHOOK_SECRET_ALT,
} from '@/lib/config';
import {
  enqueueDelivery,
  getProductRaw,
  hasFiatPurchaseByPaymentIntent,
  hasFiatPurchaseBySession,
  hasPurchased,
  hasStripeFulfillment,
  markDeliveryDoneForTarget,
  markFiatPurchaseRefundedByPaymentIntent,
  reactivateFiatPurchase,
  recordEvent,
  recordFiatPurchase,
} from '@/lib/db';
import { escapeMarkdown } from '@/lib/validate';

export const runtime = 'nodejs';

// Pin the API version explicitly to the one stripe-node 17.7.0 already targets.
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' }) : null;
let bot;
function getBot() {
  if (!bot) bot = new Bot(BOT_TOKEN);
  return bot;
}

async function refundCardPayment(paymentIntentId, code) {
  if (!paymentIntentId) throw new Error(`Cannot refund Stripe payment without a payment_intent (${code})`);
  await stripe.refunds.create(
    { payment_intent: paymentIntentId, reason: 'requested_by_customer', metadata: { gategram_reason: code } },
    { idempotencyKey: `gategram-${code}-${paymentIntentId}` },
  );
}

async function deliverAndNotify(product, buyerId, creatorShareCents, currency) {
  if (!BOT_TOKEN) throw new Error('Bot not configured for legacy card delivery');
  const b = getBot();
  const safeTitle = escapeMarkdown(product.title);
  let contentMessage;
  switch (product.content_type) {
    case 'link':
      contentMessage = `\u{1F389} *Purchase successful\\!*\n\n*${safeTitle}*\n\n\u{1F517} ${escapeMarkdown(product.content)}`;
      break;
    case 'file':
      contentMessage = `\u{1F389} *Purchase successful\\!*\n\n*${safeTitle}*`;
      break;
    default:
      contentMessage = `\u{1F389} *Purchase successful\\!*\n\n*${safeTitle}*\n\n${escapeMarkdown(product.content)}`;
      break;
  }

  await b.api.sendMessage(String(buyerId), contentMessage, { parse_mode: 'MarkdownV2' });
  if (product.content_type === 'file') {
    if (!product.file_id) throw new Error('Legacy card product file is unavailable');
    const kind = String(product.file_kind || 'document');
    if (kind === 'photo') await b.api.sendPhoto(String(buyerId), product.file_id);
    else if (kind === 'video') await b.api.sendVideo(String(buyerId), product.file_id);
    else await b.api.sendDocument(String(buyerId), product.file_id);
  }

  await b.api.sendMessage(
    String(product.creator_id),
    `\u{1F4B0} New legacy card sale\\!\n*${safeTitle}*\nCreator share: ${(creatorShareCents / 100).toFixed(2)} ${escapeMarkdown(currency)}`,
    { parse_mode: 'MarkdownV2' },
  ).catch(() => {});
}

async function finalizeLegacyFiatPurchase({ productId, buyerId, amountTotal, currency, sessionId = '', paymentIntentId = '' }) {
  if (!productId || !buyerId || !amountTotal) return;
  if (sessionId && await hasFiatPurchaseBySession(sessionId)) return;
  if (paymentIntentId && await hasFiatPurchaseByPaymentIntent(paymentIntentId)) return;
  if (await hasStripeFulfillment(sessionId, paymentIntentId)) return;

  // A paid buyer retains delivery rights even if the creator later removed the
  // listing, so use the raw row for this pre-cutover settlement path.
  const product = await getProductRaw(productId);
  if (!product) {
    await refundCardPayment(paymentIntentId, 'legacy_product_missing');
    return;
  }
  if (await hasPurchased(productId, buyerId)) {
    await refundCardPayment(paymentIntentId, 'legacy_duplicate_purchase');
    return;
  }

  const normalizedCurrency = String(currency || '').toUpperCase();
  const expectedAmount = normalizedCurrency === 'EUR'
    ? Number(product.price_eur_cents)
    : Number(product.price_usd_cents);
  if (!Number.isFinite(expectedAmount) || expectedAmount < 50 || amountTotal !== expectedAmount) {
    await refundCardPayment(paymentIntentId, 'legacy_price_mismatch');
    return;
  }

  const platformFeeCents = Math.ceil(amountTotal * PLATFORM_FEE_PERCENT / 100);
  const creatorShareCents = amountTotal - platformFeeCents;
  try {
    await recordFiatPurchase(
      productId,
      buyerId,
      amountTotal,
      normalizedCurrency,
      creatorShareCents,
      platformFeeCents,
      sessionId,
      paymentIntentId,
    );
  } catch (err) {
    if (!err?.message?.includes('UNIQUE constraint')) throw err;
    const reactivated = await reactivateFiatPurchase(
      productId,
      buyerId,
      amountTotal,
      normalizedCurrency,
      creatorShareCents,
      platformFeeCents,
      sessionId,
      paymentIntentId,
    );
    if (!reactivated) {
      if (await hasStripeFulfillment(sessionId, paymentIntentId)) return;
      await refundCardPayment(paymentIntentId, 'legacy_duplicate_purchase');
      return;
    }
  }

  let delivered = false;
  try {
    await deliverAndNotify(product, buyerId, creatorShareCents, normalizedCurrency);
    await markDeliveryDoneForTarget(productId, buyerId);
    delivered = true;
  } catch (err) {
    console.error('Legacy Stripe delivery failed; queued for retry:', err?.message || err);
    await enqueueDelivery(productId, buyerId, 'stripe');
  }
  await recordEvent({
    eventType: 'payment_success',
    productId,
    creatorId: product.creator_id,
    buyerId,
    source: 'stripe_legacy',
    meta: { rail: 'card', cutoff: STRIPE_LEGACY_CUTOFF_UNIX },
  });
  if (delivered) {
    await recordEvent({ eventType: 'delivered', productId, creatorId: product.creator_id, buyerId, source: 'stripe_legacy', meta: { rail: 'card' } });
  }
}

async function processCardCompletion({ created, productId, buyerId, amountTotal, currency, sessionId = '', paymentIntentId = '' }) {
  if (!productId || !buyerId) return;
  if (Number(created || 0) <= STRIPE_LEGACY_CUTOFF_UNIX) {
    await finalizeLegacyFiatPurchase({ productId, buyerId, amountTotal, currency, sessionId, paymentIntentId });
    return;
  }

  // New Gategram card checkouts are retired. If a stale client or manually
  // replayed integration creates one after the cutoff, reverse it instead of
  // acknowledging a charge that Gategram will not fulfill.
  if (paymentIntentId) {
    await refundCardPayment(paymentIntentId, 'card_checkout_retired');
  }
}

export async function POST(req) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  const payload = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (errPrimary) {
    if (STRIPE_WEBHOOK_SECRET_ALT) {
      try {
        event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET_ALT);
      } catch {
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }
  }

  // Settle sessions that were already in flight when card checkout was retired.
  // Post-cutover Gategram completions are automatically reversed.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await processCardCompletion({
      created: session.created,
      productId: String(session.metadata?.product_id || ''),
      buyerId: String(session.metadata?.buyer_telegram_id || ''),
      currency: String(session.currency || session.metadata?.currency || 'USD'),
      amountTotal: Number(session.amount_total || 0),
      sessionId: String(session.id || ''),
      paymentIntentId: String(session.payment_intent || ''),
    });
  }

  // checkout.session.completed is the sole settlement decision for Gategram's
  // retired Checkout flow. A PaymentIntent can be created later than its
  // Session, so using its timestamp as a second cutover decision could both
  // fulfill and refund the same in-flight purchase.

  // Refund / chargeback / dispute: revoke access and reverse the sale so the
  // buyer no longer keeps the content for free and the creator share is removed
  // from the payout queue. Keyed by payment_intent.
  if (
    event.type === 'charge.refunded' ||
    event.type === 'refund.created' ||
    event.type === 'refund.updated' ||
    event.type === 'charge.dispute.created' ||
    event.type === 'charge.dispute.funds_withdrawn'
  ) {
    const obj = event.data.object;
    const paymentIntentId = String(obj.payment_intent || '');
    if (paymentIntentId) {
      const reversed = await markFiatPurchaseRefundedByPaymentIntent(paymentIntentId);
      if (reversed?.product_id && BOT_TOKEN) {
        const product = await getProductRaw(reversed.product_id).catch(() => null);
        if (product?.creator_id) {
          const safeTitle = escapeMarkdown(product.title || 'your creation');
          await getBot().api.sendMessage(
            String(product.creator_id),
            `\u{1F4B8} *Refund / chargeback*\n\n*${safeTitle}*\nA card payment was reversed; the sale has been removed from your balance\\.`,
            { parse_mode: 'MarkdownV2' },
          ).catch(() => {});
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
