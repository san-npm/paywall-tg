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

// POST — create an invoice link for in-app purchase
export async function POST(req) {
  const requestId = randomUUID();
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'Bot not configured', request_id: requestId }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body', request_id: requestId }, { status: 400 });
  }

  const { init_data, product_id } = body;

  // Validate initData
  const initData = validateInitData(init_data);
  if (!initData || !initData.user?.id) {
    return NextResponse.json({ error: 'Invalid or missing Telegram authentication', request_id: requestId }, { status: 401 });
  }

  const buyerId = String(initData.user.id);

  // Rate limit: 30 invoices per hour per user
  const { limited } = await checkRateLimit(`invoice:${buyerId}`, 30);
  if (limited) {
    console.warn(JSON.stringify({ event: 'invoice_rate_limited', scope: 'buyer_hour', buyerId, requestId }));
    return NextResponse.json({ error: 'Too many purchase attempts. Please wait.', request_id: requestId }, { status: 429 });
  }

  const productLimit = await checkRateLimit(`invoice:${buyerId}:${String(product_id || '')}`, 10);
  if (productLimit.limited) {
    console.warn(JSON.stringify({ event: 'invoice_rate_limited', scope: 'buyer_product_hour', buyerId, productId: String(product_id || ''), requestId }));
    return NextResponse.json({ error: 'Too many repeated attempts for this product. Please wait.', request_id: requestId }, { status: 429 });
  }

  if (!product_id) {
    return NextResponse.json({ error: 'product_id required', request_id: requestId }, { status: 400 });
  }

  if (!isValidProductId(product_id)) {
    return NextResponse.json({ error: 'Invalid product_id', request_id: requestId }, { status: 400 });
  }

  // Get product
  const product = await getProduct(product_id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found', request_id: requestId }, { status: 404 });
  }

  // Can't buy your own product
  if (product.creator_id === buyerId) {
    return NextResponse.json({ error: "You can't buy your own product", request_id: requestId }, { status: 400 });
  }

  // Check if already purchased
  if (await hasPurchased(product_id, buyerId)) {
    return NextResponse.json({ error: 'Already purchased', request_id: requestId }, { status: 400 });
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

    return NextResponse.json({ invoice_url: invoiceLink, request_id: requestId });
  } catch (err) {
    console.error('Create invoice error:', { requestId, err });
    return NextResponse.json({ error: 'Failed to create invoice', request_id: requestId }, { status: 500 });
  }
}
