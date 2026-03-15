import { NextResponse } from 'next/server';
import { Bot } from 'grammy';
import { randomUUID } from 'crypto';
import { BOT_TOKEN, TELEGRAM_CURRENCY } from '@/lib/config';
import { getProduct, hasPurchased } from '@/lib/db';
import { validateInitData, isValidProductId } from '@/lib/validate';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

let bot;
function getBot() {
  if (!bot) bot = new Bot(BOT_TOKEN);
  return bot;
}

function jsonWithRequestId(payload, requestId, status = 200) {
  return NextResponse.json({ ...payload, request_id: requestId }, { status });
}

// POST — create an invoice link for in-app purchase
export async function POST(req) {
  const requestId = randomUUID();
  if (!BOT_TOKEN) {
    return jsonWithRequestId({ error: 'Bot not configured' }, requestId, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonWithRequestId({ error: 'Invalid JSON body' }, requestId, 400);
  }

  const { init_data, product_id } = body;

  // Validate initData
  const initData = validateInitData(init_data);
  if (!initData || !initData.user?.id) {
    return jsonWithRequestId({ error: 'Invalid or missing Telegram authentication' }, requestId, 401);
  }

  const buyerId = String(initData.user.id);

  // Rate limit: 30 invoices per hour per user
  const { limited } = await checkRateLimit(`invoice:${buyerId}`, 30);
  if (limited) {
    console.warn(JSON.stringify({ event: 'invoice_rate_limited', scope: 'buyer_hour', buyerId, requestId }));
    return jsonWithRequestId({ error: 'Too many purchase attempts. Please wait.' }, requestId, 429);
  }

  if (!product_id) {
    return jsonWithRequestId({ error: 'product_id required' }, requestId, 400);
  }

  if (!isValidProductId(product_id)) {
    return jsonWithRequestId({ error: 'Invalid product_id' }, requestId, 400);
  }

  const normalizedProductId = String(product_id);
  const productLimit = await checkRateLimit(`invoice:${buyerId}:${normalizedProductId}`, 10);
  if (productLimit.limited) {
    console.warn(JSON.stringify({ event: 'invoice_rate_limited', scope: 'buyer_product_hour', buyerId, productId: normalizedProductId, requestId }));
    return jsonWithRequestId({ error: 'Too many repeated attempts for this product. Please wait.' }, requestId, 429);
  }

  // Get product
  const product = await getProduct(product_id);
  if (!product) {
    return jsonWithRequestId({ error: 'Product not found' }, requestId, 404);
  }

  const methods = String(product.payment_methods || 'stars,stripe').split(',').map(v => v.trim().toLowerCase());
  if (!methods.includes('stars')) {
    return jsonWithRequestId({ error: 'Stars payments are disabled for this product' }, requestId, 400);
  }

  // Can't buy your own product
  if (String(product.creator_id) === String(buyerId)) {
    return jsonWithRequestId({ error: "You can't buy your own product" }, requestId, 400);
  }

  // Check if already purchased
  if (await hasPurchased(product_id, buyerId)) {
    return jsonWithRequestId({ error: 'Already purchased' }, requestId, 400);
  }

  try {
    const b = getBot();
    const invoiceLink = await b.api.createInvoiceLink(
      product.title,
      product.description || 'Digital content',
      product_id, // payload
      TELEGRAM_CURRENCY, // Telegram Stars
      [{ label: product.title, amount: product.price_stars }]
    );

    return jsonWithRequestId({ invoice_url: invoiceLink }, requestId, 200);
  } catch (err) {
    console.error('Create invoice error:', { requestId, err });
    return jsonWithRequestId({ error: 'Failed to create invoice' }, requestId, 500);
  }
}
