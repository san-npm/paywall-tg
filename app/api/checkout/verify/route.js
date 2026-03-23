import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Bot } from 'grammy';
import { BOT_TOKEN, ENABLE_STRIPE, PLATFORM_FEE_PERCENT, STRIPE_SECRET_KEY } from '@/lib/config';
import { getProduct, hasFiatPurchaseByPaymentIntent, hasFiatPurchaseBySession, hasPurchased, recordFiatPurchase, enqueueDelivery } from '@/lib/db';
import { escapeMarkdown } from '@/lib/validate';
import { checkRateLimit } from '@/lib/rateLimit';

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
    if (product.file_id) await b.api.sendDocument(String(buyerId), product.file_id);
    else await b.api.sendMessage(String(buyerId), 'The file for this product is not yet available. Contact the creator.');
  }

  const creatorMsg = `💰 New sale!\n*${safeTitle}*\nYou earned ${creatorShareCents / 100} ${escapeMarkdown(currency)}`;
  await b.api.sendMessage(String(product.creator_id), creatorMsg, { parse_mode: 'MarkdownV2' }).catch(() => {});
}

export async function GET(req) {
  if (!ENABLE_STRIPE) return NextResponse.json({ error: 'Card payments are temporarily disabled' }, { status: 403 });
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const sessionId = String(searchParams.get('session_id') || '').trim();
  if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 });

  // Rate limit by session ID to prevent probing
  const { limited } = await checkRateLimit(`verify:${sessionId}`, 10);
  if (limited) return NextResponse.json({ error: 'Too many verification attempts' }, { status: 429 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session) return NextResponse.json({ error: 'Checkout session not found' }, { status: 404 });
  if (session.payment_status !== 'paid') return NextResponse.json({ ok: false, paid: false });

  const productId = String(session.metadata?.product_id || '');
  const buyerId = String(session.metadata?.buyer_telegram_id || '');
  const currency = String(session.currency || session.metadata?.currency || 'USD').toUpperCase();
  const amountTotal = Number(session.amount_total || 0);
  const paymentIntentId = String(session.payment_intent || '');

  if (!productId || !buyerId || !amountTotal) {
    return NextResponse.json({ error: 'Missing metadata on checkout session' }, { status: 400 });
  }

  if (await hasFiatPurchaseBySession(sessionId) || (paymentIntentId && await hasFiatPurchaseByPaymentIntent(paymentIntentId))) {
    return NextResponse.json({ ok: true, delivered: true, alreadyProcessed: true });
  }

  const product = await getProduct(productId);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  if (await hasPurchased(productId, buyerId)) return NextResponse.json({ ok: true, delivered: true, alreadyProcessed: true });

  // Verify amount matches expected product price (defense-in-depth)
  const expectedAmount = currency === 'EUR'
    ? Number(product.price_eur_cents)
    : Number(product.price_usd_cents);
  if (expectedAmount && amountTotal !== expectedAmount) {
    console.error('Checkout verify price mismatch — rejecting', { expected: expectedAmount, got: amountTotal, productId, currency });
    return NextResponse.json({ error: 'Price mismatch' }, { status: 400 });
  }

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

  await deliverAndNotify(product, buyerId, creatorShareCents, currency).catch(async (err) => {
    console.error('Checkout verify delivery failed, queuing for retry:', err?.message || err);
    await enqueueDelivery(productId, buyerId, 'stripe').catch(() => {});
  });

  return NextResponse.json({ ok: true, delivered: true });
}
