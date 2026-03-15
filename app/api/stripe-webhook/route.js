import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Bot } from 'grammy';
import { BOT_TOKEN, PLATFORM_FEE_PERCENT, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET_ALT } from '@/lib/config';
import { getProduct, hasFiatPurchaseByPaymentIntent, hasFiatPurchaseBySession, hasPurchased, recordFiatPurchase } from '@/lib/db';
import { escapeMarkdown } from '@/lib/validate';

export const runtime = 'nodejs';

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
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
      contentMessage = `🎉 *Purchase successful!*\n\n*${safeTitle}*\n\n${escapeMarkdown(product.content)}`;
      break;
    case 'link':
      contentMessage = `🎉 *Purchase successful!*\n\n*${safeTitle}*\n\n🔗 ${escapeMarkdown(product.content)}`;
      break;
    case 'file':
      contentMessage = `🎉 *Purchase successful!*\n\n*${safeTitle}*`;
      break;
    default:
      contentMessage = `🎉 *Purchase successful!*\n\n*${safeTitle}*\n\n${escapeMarkdown(product.content)}`;
      break;
  }

  await b.api.sendMessage(String(buyerId), contentMessage, { parse_mode: 'MarkdownV2' });
  if (product.content_type === 'file') {
    if (product.file_id) {
      await b.api.sendDocument(String(buyerId), product.file_id);
    } else {
      await b.api.sendMessage(String(buyerId), 'The file for this product is not yet available. Contact the creator.');
    }
  }

  const creatorMsg = `💰 New sale!\n*${safeTitle}*\nYou earned ${creatorShareCents / 100} ${escapeMarkdown(currency)}`;
  await b.api.sendMessage(String(product.creator_id), creatorMsg, { parse_mode: 'MarkdownV2' })
    .catch(() => {});
}

async function finalizeFiatPurchase({ productId, buyerId, amountTotal, currency, sessionId = '', paymentIntentId = '' }) {
  if (!productId || !buyerId || !amountTotal) return;

  if (sessionId && await hasFiatPurchaseBySession(sessionId)) return;
  if (paymentIntentId && await hasFiatPurchaseByPaymentIntent(paymentIntentId)) return;

  const product = await getProduct(productId);
  if (!product) return;

  if (await hasPurchased(productId, buyerId)) return;

  const platformFeeCents = Math.ceil(amountTotal * PLATFORM_FEE_PERCENT / 100);
  const creatorShareCents = amountTotal - platformFeeCents;

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

  await deliverAndNotify(product, buyerId, creatorShareCents, currency).catch((err) => {
    console.error('Stripe delivery notify failed:', err?.message || err);
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
      } catch (errAlt) {
        return NextResponse.json({ error: `Webhook Error: ${errAlt.message}` }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: `Webhook Error: ${errPrimary.message}` }, { status: 400 });
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

  return NextResponse.json({ received: true });
}
