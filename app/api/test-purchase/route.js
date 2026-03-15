import { NextResponse } from 'next/server';
import { Bot } from 'grammy';
import { BOT_TOKEN, ENABLE_FAKE_PAYMENTS, PLATFORM_FEE_PERCENT } from '@/lib/config';
import { getProduct, hasPurchased, recordPurchase } from '@/lib/db';
import { validateInitData, escapeMarkdown, isValidProductId } from '@/lib/validate';

export const runtime = 'nodejs';

let bot;
function getBot() {
  if (!bot) bot = new Bot(BOT_TOKEN);
  return bot;
}

export async function POST(req) {
  if (!ENABLE_FAKE_PAYMENTS) {
    return NextResponse.json({ error: 'Fake payments disabled' }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const initData = validateInitData(body?.init_data);
  if (!initData?.user?.id) {
    return NextResponse.json({ error: 'Invalid or missing Telegram authentication' }, { status: 401 });
  }

  const buyerId = String(initData.user.id);
  const productId = String(body?.product_id || '');
  if (!isValidProductId(productId)) {
    return NextResponse.json({ error: 'Invalid product_id' }, { status: 400 });
  }

  const product = await getProduct(productId);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  if (String(product.creator_id) === String(buyerId)) {
    return NextResponse.json({ error: "You can't buy your own product" }, { status: 400 });
  }

  if (await hasPurchased(productId, buyerId)) {
    return NextResponse.json({ ok: true, alreadyPurchased: true });
  }

  const starsPaid = Number(product.price_stars || 0);
  const platformFee = Math.ceil(starsPaid * PLATFORM_FEE_PERCENT / 100);
  const creatorShare = starsPaid - platformFee;
  const fakeChargeId = `test_${productId}_${buyerId}_${Date.now()}`;

  await recordPurchase(productId, buyerId, starsPaid, creatorShare, platformFee, fakeChargeId);

  if (BOT_TOKEN) {
    const b = getBot();
    const safeTitle = escapeMarkdown(product.title);

    let contentMessage = '';
    switch (product.content_type) {
      case 'text':
        contentMessage = `🧪 *Test purchase successful!*\n\n*${safeTitle}*\n\n${escapeMarkdown(product.content)}`;
        break;
      case 'link':
        contentMessage = `🧪 *Test purchase successful!*\n\n*${safeTitle}*\n\n🔗 ${escapeMarkdown(product.content)}`;
        break;
      case 'file':
        contentMessage = `🧪 *Test purchase successful!*\n\n*${safeTitle}*`;
        break;
      default:
        contentMessage = `🧪 *Test purchase successful!*\n\n*${safeTitle}*\n\n${escapeMarkdown(product.content)}`;
    }

    await b.api.sendMessage(buyerId, contentMessage, { parse_mode: 'MarkdownV2' });
    if (product.content_type === 'file') {
      if (product.file_id) await b.api.sendDocument(buyerId, product.file_id);
      else await b.api.sendMessage(buyerId, 'Test mode: file is not attached yet for this product.');
    }

    const creatorMsg = `🧪 Test sale\!\n*${safeTitle}*\nSimulated buyer generated ⭐ ${creatorShare} creator share`;
    await b.api.sendMessage(product.creator_id, creatorMsg, { parse_mode: 'MarkdownV2' }).catch(() => {});
  }

  return NextResponse.json({ ok: true, simulated: true });
}
