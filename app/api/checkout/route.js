import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ENABLE_STRIPE, STRIPE_SECRET_KEY, WEBAPP_URL } from '@/lib/config';
import { getProduct, hasPurchased } from '@/lib/db';
import { validateInitData, isValidProductId } from '@/lib/validate';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

export async function POST(req) {
  if (!ENABLE_STRIPE) {
    return NextResponse.json({ error: 'Card payments are temporarily disabled' }, { status: 403 });
  }
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { init_data, product_id, currency = 'EUR' } = body;
  const initData = validateInitData(init_data);
  if (!initData?.user?.id) {
    return NextResponse.json({ error: 'Invalid or missing Telegram authentication' }, { status: 401 });
  }

  const buyerId = String(initData.user.id);
  const normalizedCurrency = String(currency || 'EUR').toUpperCase();
  if (!['EUR', 'USD'].includes(normalizedCurrency)) {
    return NextResponse.json({ error: 'Unsupported currency. Use EUR or USD.' }, { status: 400 });
  }

  const { limited } = await checkRateLimit(`checkout:${buyerId}`, 30);
  if (limited) {
    return NextResponse.json({ error: 'Too many checkout attempts. Please wait.' }, { status: 429 });
  }

  if (!product_id || !isValidProductId(product_id)) {
    return NextResponse.json({ error: 'Invalid product_id' }, { status: 400 });
  }

  const product = await getProduct(product_id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const methods = String(product.payment_methods || 'stars,stripe').split(',').map(v => v.trim().toLowerCase());
  if (!methods.includes('stripe')) {
    return NextResponse.json({ error: 'Card payments are disabled for this product' }, { status: 400 });
  }

  if (String(product.creator_id) === String(buyerId)) {
    return NextResponse.json({ error: "You can't buy your own product" }, { status: 400 });
  }

  if (await hasPurchased(product_id, buyerId)) {
    return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
  }

  const amount = normalizedCurrency === 'EUR'
    ? Number(product.price_eur_cents)
    : Number(product.price_usd_cents);

  if (!Number.isFinite(amount) || amount < 50) {
    return NextResponse.json({ error: 'Invalid fiat price for this product' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${WEBAPP_URL}/buy/${product_id}?paid=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${WEBAPP_URL}/buy/${product_id}?cancelled=1`,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: normalizedCurrency.toLowerCase(),
        unit_amount: amount,
        product_data: {
          name: product.title,
          description: product.description || 'Digital content',
        },
      },
    }],
    metadata: {
      source: 'gategram',
      product_id: String(product_id),
      buyer_telegram_id: buyerId,
      creator_telegram_id: String(product.creator_id),
      currency: normalizedCurrency,
    },
    payment_intent_data: {
      metadata: {
        source: 'gategram',
        product_id: String(product_id),
        buyer_telegram_id: buyerId,
        creator_telegram_id: String(product.creator_id),
        currency: normalizedCurrency,
      },
    },
  });

  return NextResponse.json({ checkout_url: session.url, session_id: session.id });
}
