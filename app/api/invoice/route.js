import { NextResponse } from 'next/server';
import { Bot } from 'grammy';
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
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { init_data, product_id } = body;

  // Validate initData
  const initData = validateInitData(init_data);
  if (!initData || !initData.user?.id) {
    return NextResponse.json({ error: 'Invalid or missing Telegram authentication' }, { status: 401 });
  }

  const buyerId = String(initData.user.id);

  // Rate limit: 30 invoices per hour per user
  const { limited } = await checkRateLimit(`invoice:${buyerId}`, 30);
  if (limited) {
    return NextResponse.json({ error: 'Too many purchase attempts. Please wait.' }, { status: 429 });
  }

  if (!product_id) {
    return NextResponse.json({ error: 'product_id required' }, { status: 400 });
  }

  if (!isValidProductId(product_id)) {
    return NextResponse.json({ error: 'Invalid product_id' }, { status: 400 });
  }

  // Get product
  const product = await getProduct(product_id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const methods = String(product.payment_methods || 'stars,stripe').split(',').map(v => v.trim().toLowerCase());
  if (!methods.includes('stars')) {
    return NextResponse.json({ error: 'Stars payments are disabled for this product' }, { status: 400 });
  }

  // Can't buy your own product
  if (String(product.creator_id) === String(buyerId)) {
    return NextResponse.json({ error: "You can't buy your own product" }, { status: 400 });
  }

  // Check if already purchased
  if (await hasPurchased(product_id, buyerId)) {
    return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
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

    return NextResponse.json({ invoice_url: invoiceLink });
  } catch (err) {
    console.error('Create invoice error:', err);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
