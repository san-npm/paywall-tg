import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Bot } from 'grammy';
import { BOT_TOKEN, PLATFORM_FEE_PERCENT, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET_ALT } from '@/lib/config';
import { getProduct, hasFiatPurchaseByPaymentIntent, hasFiatPurchaseBySession, hasStripeFulfillment, hasPurchased, recordFiatPurchase, reactivateFiatPurchase, enqueueDelivery, markFiatPurchaseRefundedByPaymentIntent } from '@/lib/db';
import { escapeMarkdown } from '@/lib/validate';

export const runtime = 'nodejs';

// Pin the API version explicitly to the one stripe-node 17.7.0 already targets.
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' }) : null;
let bot;
function getBot() {
  if (!bot) bot = new Bot(BOT_TOKEN);
  return bot;
}

async function deliverAndNotify(product, buyerId, creatorShareCents, currency) {
  if (!BOT_TOKEN) return;
  const b = getBot();
  const safeTitle = escapeMarkdown(product.title);
  let contentMessage = '';
  switch (product.content_type) {
    case 'text':
      contentMessage = `\u{1F389} *Purchase successful\\!*\n\n*${safeTitle}*\n\n${escapeMarkdown(product.content)}`;
      break;
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
    if (product.file_id) {
      const kind = String(product.file_kind || 'document');
      if (kind === 'photo') {
        await b.api.sendPhoto(String(buyerId), product.file_id);
      } else if (kind === 'video') {
        await b.api.sendVideo(String(buyerId), product.file_id);
      } else {
        await b.api.sendDocument(String(buyerId), product.file_id);
      }
    } else {
      await b.api.sendMessage(String(buyerId), 'The file for this product is not yet available\\. Contact the creator\\.', { parse_mode: 'MarkdownV2' });
    }
  }

  const creatorMsg = `\u{1F4B0} New sale\\!\n*${safeTitle}*\nYou earned ${creatorShareCents / 100} ${escapeMarkdown(currency)}`;
  await b.api.sendMessage(String(product.creator_id), creatorMsg, { parse_mode: 'MarkdownV2' })
    .catch(() => {});
}

async function finalizeFiatPurchase({ productId, buyerId, amountTotal, currency, sessionId = '', paymentIntentId = '' }) {
  if (!productId || !buyerId || !amountTotal) return;

  if (sessionId && await hasFiatPurchaseBySession(sessionId)) return;
  if (paymentIntentId && await hasFiatPurchaseByPaymentIntent(paymentIntentId)) return;
  // Authoritative replay guard: a consumed session/payment_intent is never
  // fulfilled twice, even after a reactivate overwrote the row's ids.
  if (await hasStripeFulfillment(sessionId, paymentIntentId)) return;

  const product = await getProduct(productId);
  if (!product) return;

  if (await hasPurchased(productId, buyerId)) return;

  // Defense-in-depth: verify amount matches expected product price
  const normalizedCurrency = String(currency || '').toUpperCase();
  const expectedAmount = normalizedCurrency === 'EUR'
    ? Number(product.price_eur_cents)
    : Number(product.price_usd_cents);
  // Fail closed: a missing/NaN/sub-minimum expected price must never skip the check.
  if (!Number.isFinite(expectedAmount) || expectedAmount < 50 || amountTotal !== expectedAmount) {
    console.error('Stripe fiat price mismatch — rejecting', { expected: expectedAmount, got: amountTotal, productId, currency: normalizedCurrency });
    return;
  }

  const platformFeeCents = Math.ceil(amountTotal * PLATFORM_FEE_PERCENT / 100);
  const creatorShareCents = amountTotal - platformFeeCents;

  try {
    await recordFiatPurchase(
      productId,
      buyerId,
      amountTotal,
      currency,
      creatorShareCents,
      platformFeeCents,
      sessionId,
      paymentIntentId,
    );
  } catch (err) {
    if (err?.message?.includes('UNIQUE constraint')) {
      // A prior refunded fiat purchase by this buyer blocks a fresh INSERT on
      // UNIQUE(product_id, buyer_telegram_id). Reactivate it so a paying re-buyer
      // gets their content; if nothing was refunded the buyer already owns it, so stop.
      const reactivated = await reactivateFiatPurchase(
        productId, buyerId, amountTotal, currency, creatorShareCents, platformFeeCents, sessionId, paymentIntentId,
      );
      if (!reactivated) return;
    } else {
      throw err;
    }
  }

  await deliverAndNotify(product, buyerId, creatorShareCents, currency).catch(async (err) => {
    console.error('Stripe delivery notify failed, queuing for retry:', err?.message || err);
    await enqueueDelivery(productId, buyerId, 'stripe').catch(() => {});
  });
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await finalizeFiatPurchase({
      productId: String(session.metadata?.product_id || ''),
      buyerId: String(session.metadata?.buyer_telegram_id || ''),
      currency: String(session.currency || session.metadata?.currency || 'USD').toUpperCase(),
      amountTotal: Number(session.amount_total || 0),
      sessionId: String(session.id || ''),
      paymentIntentId: String(session.payment_intent || ''),
    });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    await finalizeFiatPurchase({
      productId: String(pi.metadata?.product_id || ''),
      buyerId: String(pi.metadata?.buyer_telegram_id || ''),
      currency: String(pi.currency || pi.metadata?.currency || 'USD').toUpperCase(),
      amountTotal: Number(pi.amount_received || pi.amount || 0),
      paymentIntentId: String(pi.id || ''),
    });
  }

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
        const product = await getProduct(reversed.product_id).catch(() => null);
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
