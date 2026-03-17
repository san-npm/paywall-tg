import { NextResponse } from 'next/server';
import { Bot } from 'grammy';
import { BOT_TOKEN, WEBAPP_URL, PLATFORM_FEE_PERCENT, MAX_PRICE_STARS, ADMIN_TELEGRAM_IDS, TELEGRAM_CURRENCY, ENABLE_FAKE_PAYMENTS } from '@/lib/config';
import {
  getOrCreateCreator, createProduct, getProduct, getProductRaw, getCreatorProducts,
  getCreatorStats, recordPurchase, hasPurchased, markPurchaseRefunded, attachFileToProduct, markUpdateProcessed, setProductActive, logAdminAction,
  setPendingAttach, getPendingAttach, clearPendingAttach
} from '@/lib/db';
import { verifyWebhookSecret, escapeMarkdown, parseNewCommand, isValidProductId, generateShortId, sanitizeErrorMessage } from '@/lib/validate';

export const runtime = 'nodejs';


let bot;
function getBot() {
  if (!bot) bot = new Bot(BOT_TOKEN);
  return bot;
}

async function deliverPaidMedia(api, chatId, product) {
  if (product.content_type !== 'file') return;
  if (!product.file_id) {
    await api.sendMessage(chatId, 'The media for this creation is not yet available. Contact the creator.');
    return;
  }
  const kind = String(product.file_kind || 'document');
  if (kind === 'photo') {
    await api.sendPhoto(chatId, product.file_id);
  } else if (kind === 'video') {
    await api.sendVideo(chatId, product.file_id);
  } else {
    await api.sendDocument(chatId, product.file_id);
  }
}

export async function POST(req) {
  if (!BOT_TOKEN) return NextResponse.json({ ok: false }, { status: 500 });

  // Verify webhook secret from Telegram
  if (!verifyWebhookSecret(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Idempotency guard: ignore duplicate Telegram update deliveries
  if (body?.update_id !== undefined && body?.update_id !== null) {
    const firstSeen = await markUpdateProcessed(body.update_id);
    if (!firstSeen) {
      return NextResponse.json({ ok: true });
    }
  }

  const b = getBot();

  try {
    // Handle pre_checkout_query (must respond within 10 seconds)
    if (body.pre_checkout_query) {
      const query = body.pre_checkout_query;
      const productId = String(query.invoice_payload || '');
      const buyerId = String(query.from.id);
      if (!isValidProductId(productId)) {
        await b.api.answerPreCheckoutQuery(query.id, false, { error_message: 'Invalid product.' });
        return NextResponse.json({ ok: true });
      }
      const product = await getProduct(productId);

      // Validate product exists and price/currency match
      if (!product) {
        await b.api.answerPreCheckoutQuery(query.id, false, { error_message: 'Creation no longer available.' });
        return NextResponse.json({ ok: true });
      }
      if (query.currency !== TELEGRAM_CURRENCY) {
        await b.api.answerPreCheckoutQuery(query.id, false, { error_message: 'Unsupported payment currency.' });
        return NextResponse.json({ ok: true });
      }
      if (query.total_amount !== product.price_stars) {
        await b.api.answerPreCheckoutQuery(query.id, false, { error_message: 'Price has changed. Please try again.' });
        return NextResponse.json({ ok: true });
      }
      if (String(product.creator_id) === String(buyerId)) {
        await b.api.answerPreCheckoutQuery(query.id, false, { error_message: 'You cannot buy your own product.' });
        return NextResponse.json({ ok: true });
      }
      // Prevent duplicate purchase
      if (await hasPurchased(productId, buyerId)) {
        await b.api.answerPreCheckoutQuery(query.id, false, { error_message: 'You already purchased this creation.' });
        return NextResponse.json({ ok: true });
      }

      await b.api.answerPreCheckoutQuery(query.id, true);
      return NextResponse.json({ ok: true });
    }

    // Handle refunded payment
    if (body.message?.refunded_payment) {
      const refund = body.message.refunded_payment;
      const buyerId = String(body.message.from.id);
      const productId = String(refund.invoice_payload || '');
      if (!isValidProductId(productId)) {
        return NextResponse.json({ ok: true });
      }

      const marked = await markPurchaseRefunded(productId, buyerId);

      if (marked) {
        const product = await getProductRaw(productId);
        if (product) {
          const safeTitle = escapeMarkdown(product.title);
          // Notify creator about the refund
          await b.api.sendMessage(product.creator_id,
            `\u{1F4B8} *Refund processed*\n\n*${safeTitle}*\nA buyer received a refund of \u2B50 ${refund.total_amount} Stars`,
            { parse_mode: 'MarkdownV2' }
          ).catch(err => console.error('Failed to notify creator of refund:', err.message));
        }
      }

      return NextResponse.json({ ok: true });
    }

    // Handle successful payment
    if (body.message?.successful_payment) {
      const payment = body.message.successful_payment;
      const buyerId = String(body.message.from.id);
      const productId = String(payment.invoice_payload || '');
      if (!isValidProductId(productId)) {
        return NextResponse.json({ ok: true });
      }
      const product = await getProduct(productId);

      if (product) {
        // Verify payment payload integrity before delivery
        if (payment.currency !== TELEGRAM_CURRENCY) {
          console.error('Payment currency mismatch', { expected: TELEGRAM_CURRENCY, got: payment.currency });
          return NextResponse.json({ ok: true });
        }
        if (!payment.telegram_payment_charge_id) {
          console.error('Missing payment charge id');
          return NextResponse.json({ ok: true });
        }
        if (payment.total_amount !== product.price_stars) {
          console.error('Payment amount mismatch', { expected: product.price_stars, got: payment.total_amount });
          return NextResponse.json({ ok: true });
        }

        const starsPaid = payment.total_amount;
        const platformFee = Math.ceil(starsPaid * PLATFORM_FEE_PERCENT / 100);
        const creatorShare = starsPaid - platformFee;

        try {
          await recordPurchase(productId, buyerId, starsPaid, creatorShare, platformFee, payment.telegram_payment_charge_id);
        } catch (err) {
          // UNIQUE constraint violation = duplicate, silently skip
          if (err.message?.includes('UNIQUE constraint')) {
            return NextResponse.json({ ok: true });
          }
          throw err;
        }

        // Deliver the content
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
          case 'message':
            contentMessage = `\u{1F389} *Purchase successful\\!*\n\n*${safeTitle}*\n\n${escapeMarkdown(product.content)}`;
            break;
        }

        await b.api.sendMessage(buyerId, contentMessage, { parse_mode: 'MarkdownV2' });

        try {
          await deliverPaidMedia(b.api, buyerId, product);
        } catch (mediaErr) {
          console.error('deliverPaidMedia failed:', mediaErr?.message || mediaErr);
          await b.api.sendMessage(buyerId, '\u26A0\uFE0F Media delivery failed. Contact the creator for assistance.').catch(() => {});
        }

        // Notify creator
        const creatorMsg = `\u{1F4B0} New sale\\!\n*${safeTitle}*\nBuyer earned you \u2B50 ${creatorShare} Stars`;
        await b.api.sendMessage(product.creator_id, creatorMsg, { parse_mode: 'MarkdownV2' })
          .catch(err => console.error('Failed to notify creator:', product.creator_id, err.message));
      }

      return NextResponse.json({ ok: true });
    }

    // Handle messages (text commands)
    if (body.message?.text) {
      const msg = body.message;
      const chatId = msg.chat.id;
      const userId = String(msg.from.id);
      const text = msg.text;

      // /start command
      if (text === '/start') {
        await getOrCreateCreator(userId, msg.from.username ?? null, msg.from.first_name ?? null);
        await b.api.sendMessage(chatId,
          `👋 Welcome to Gategram\n\nSell paid creations in Telegram. Get paid in Stars.\n\n` +
          `How it works:\n` +
          `1) Create a paid creation\n` +
          `2) Share your buy link\n` +
          `3) Get paid when someone buys\n\n` +
          `Commands:\n` +
          `📦 /create — Create a paid creation\n` +
          `📋 /products — View your products\n` +
          `📊 /dashboard — View sales and earnings\n` +
          `🛒 /buy <product_id> — Buy a product\n\n` +
          `Tap Open Gategram below to start.`,
          {
            reply_markup: {
              inline_keyboard: [[
                { text: '🚀 Open Gategram', web_app: { url: `${WEBAPP_URL}/dashboard` } }
              ]]
            }
          }
        );
      }

      // /create command
      else if (text === '/create') {
        await getOrCreateCreator(userId, msg.from.username ?? null, msg.from.first_name ?? null);
        await b.api.sendMessage(chatId,
          `Ready to sell?\n\n` +
          `Tap the button below to open Gategram and set up your paid creation in under a minute.`,
          {
            reply_markup: {
              inline_keyboard: [[
                { text: 'Create in Gategram', web_app: { url: `${WEBAPP_URL}/create` } }
              ]]
            }
          }
        );
      }

      // /new <price> <title> | <content>
      else if (text.startsWith('/new ')) {
        const parsed = parseNewCommand(text);

        if (!parsed.ok) {
          const map = {
            format: '\u274C Format: `/new <price> <title> | <content>`',
            price: `\u274C Price must be between 1 and ${MAX_PRICE_STARS.toLocaleString()} Stars`,
            title: '\u274C Invalid title (empty or too long).',
            content: '\u274C Invalid content (empty or too long).',
          };
          await b.api.sendMessage(chatId, map[parsed.error] || map.format, { parse_mode: 'MarkdownV2' });
          return NextResponse.json({ ok: true });
        }

        const { price, title, content } = parsed.value;
        await getOrCreateCreator(userId, msg.from.username ?? null, msg.from.first_name ?? null);
        const id = generateShortId();
        await createProduct(id, userId, title, '', price, 'text', content, null);

        const shareUrl = `https://t.me/${(await b.api.getMe()).username}?start=buy_${id}`;
        const safeTitle = escapeMarkdown(title);
        await b.api.sendMessage(chatId,
          `\u2705 *Product created\\!*\n\n` +
          `\u{1F4E6} *${safeTitle}*\n\u2B50 ${price} Stars\n\u{1F194} \`${id}\`\n\n` +
          `Share this link:\n${escapeMarkdown(shareUrl)}`,
          { parse_mode: 'MarkdownV2' }
        );
      }

      // /attach <product_id> — prompts creator to send a file
      else if (text.startsWith('/attach ')) {
        const productId = text.slice(8).trim();
        if (!isValidProductId(productId)) {
          await b.api.sendMessage(chatId, '\u274C Invalid product ID format.');
          return NextResponse.json({ ok: true });
        }
        const product = await getProductRaw(productId);

        if (!product) {
          await b.api.sendMessage(chatId, '\u274C Creation not found.');
          return NextResponse.json({ ok: true });
        }
        if (product.creator_id !== userId) {
          await b.api.sendMessage(chatId, '\u274C You can only attach media to your own creations.');
          return NextResponse.json({ ok: true });
        }
        if (product.content_type !== 'file') {
          await b.api.sendMessage(chatId, '\u274C This creation does not accept media attachments.');
          return NextResponse.json({ ok: true });
        }

        // Store pending attach in DB so the media handler can find it
        await setPendingAttach(chatId, productId);

        await b.api.sendMessage(chatId,
          `📎 Attach media to: ${product.title}\n\nSend or forward a file, photo, or video now.`,
          {
            reply_markup: { force_reply: true, selective: true, input_field_placeholder: 'Send or forward a file/photo/video...' }
          }
        );
      }

      // /start attach_<id> (deep link for attaching media from mini-app)
      else if (text.startsWith('/start attach_')) {
        const productId = text.slice(14).trim();
        if (!isValidProductId(productId)) {
          await b.api.sendMessage(chatId, '\u274C Invalid product ID format.');
          return NextResponse.json({ ok: true });
        }
        const product = await getProductRaw(productId);

        if (!product) {
          await b.api.sendMessage(chatId, '\u274C Creation not found.');
          return NextResponse.json({ ok: true });
        }
        if (product.creator_id !== userId) {
          await b.api.sendMessage(chatId, '\u274C You can only attach media to your own creations.');
          return NextResponse.json({ ok: true });
        }
        if (product.content_type !== 'file') {
          await b.api.sendMessage(chatId, '\u274C This creation does not accept media attachments.');
          return NextResponse.json({ ok: true });
        }

        // Store pending attach in DB
        await setPendingAttach(chatId, productId);

        await b.api.sendMessage(chatId,
          `📎 Attach media to: ${product.title}\n\nSend or forward a file, photo, or video now.`,
          {
            reply_markup: { force_reply: true, selective: true, input_field_placeholder: 'Send or forward a file/photo/video...' }
          }
        );
      }

      // /start buy_<id> (deep link)
      else if (text.startsWith('/start buy_')) {
        const productId = text.slice(11).trim();
        if (!isValidProductId(productId)) {
          await b.api.sendMessage(chatId, '\u274C Invalid product ID format.');
          return NextResponse.json({ ok: true });
        }
        const product = await getProduct(productId);

        if (!product) {
          await b.api.sendMessage(chatId, '\u274C Creation not found or no longer available.');
          return NextResponse.json({ ok: true });
        }

        if (await hasPurchased(productId, userId)) {
          const safeTitle = escapeMarkdown(product.title);
          let contentMessage = '';
          switch (product.content_type) {
            case 'text':
              contentMessage = `\u{1F389} *Already purchased\!*\n\n*${safeTitle}*\n\n${escapeMarkdown(product.content)}`;
              break;
            case 'link':
              contentMessage = `\u{1F389} *Already purchased\!*\n\n*${safeTitle}*\n\n\u{1F517} ${escapeMarkdown(product.content)}`;
              break;
            case 'file':
              contentMessage = `\u{1F389} *Already purchased\!*\n\n*${safeTitle}*`;
              break;
            default:
              contentMessage = `\u{1F389} *Already purchased\!*\n\n*${safeTitle}*\n\n${escapeMarkdown(product.content)}`;
              break;
          }
          await b.api.sendMessage(chatId, contentMessage, { parse_mode: 'MarkdownV2' });
          if (product.content_type === 'file') {
            try {
              await deliverPaidMedia(b.api, chatId, product);
            } catch (e) {
              await b.api.sendMessage(chatId, `⚠️ Media delivery failed: ${e?.description || e?.message || 'unknown error'}`);
            }
          }
          return NextResponse.json({ ok: true });
        }

        if (String(product.creator_id) === String(userId)) {
          await b.api.sendMessage(chatId, '\u{1F937} That\'s your own product!');
          return NextResponse.json({ ok: true });
        }

        await b.api.sendInvoice(chatId, product.title, product.description || 'Digital content', productId, TELEGRAM_CURRENCY, [
          { label: product.title, amount: product.price_stars }
        ]);      }

      // /buy <id>
      else if (text.startsWith('/buy ')) {
        const productId = text.slice(5).trim();
        if (!isValidProductId(productId)) {
          await b.api.sendMessage(chatId, '\u274C Invalid product ID format.');
          return NextResponse.json({ ok: true });
        }
        const product = await getProduct(productId);

        if (!product) {
          await b.api.sendMessage(chatId, '\u274C Creation not found or no longer available.');
          return NextResponse.json({ ok: true });
        }

        if (await hasPurchased(productId, userId)) {
          const safeTitle = escapeMarkdown(product.title);
          let contentMessage = '';
          switch (product.content_type) {
            case 'text':
              contentMessage = `\u{1F389} *Already purchased\!*\n\n*${safeTitle}*\n\n${escapeMarkdown(product.content)}`;
              break;
            case 'link':
              contentMessage = `\u{1F389} *Already purchased\!*\n\n*${safeTitle}*\n\n\u{1F517} ${escapeMarkdown(product.content)}`;
              break;
            case 'file':
              contentMessage = `\u{1F389} *Already purchased\!*\n\n*${safeTitle}*`;
              break;
            default:
              contentMessage = `\u{1F389} *Already purchased\!*\n\n*${safeTitle}*\n\n${escapeMarkdown(product.content)}`;
              break;
          }
          await b.api.sendMessage(chatId, contentMessage, { parse_mode: 'MarkdownV2' });
          if (product.content_type === 'file') {
            try {
              await deliverPaidMedia(b.api, chatId, product);
            } catch (e) {
              await b.api.sendMessage(chatId, `⚠️ Media delivery failed: ${e?.description || e?.message || 'unknown error'}`);
            }
          }
          return NextResponse.json({ ok: true });
        }

        if (String(product.creator_id) === String(userId)) {
          await b.api.sendMessage(chatId, '\u{1F937} That\'s your own product!');
          return NextResponse.json({ ok: true });
        }

        await b.api.sendInvoice(chatId, product.title, product.description || 'Digital content by creator', productId, TELEGRAM_CURRENCY, [
          { label: product.title, amount: product.price_stars }
        ]);      }

      // /testbuy <id> (no-charge simulation)
      else if (text.startsWith('/testbuy ') || text.startsWith('/testbuy@')) {
        await b.api.sendMessage(chatId, '🧪 Running test purchase...');
        if (!ENABLE_FAKE_PAYMENTS) {
          await b.api.sendMessage(chatId, '\u274C Test purchases are disabled.');
          return NextResponse.json({ ok: true });
        }

        const match = text.match(/^\/testbuy(?:@\w+)?\s+(.+)$/);
        const productId = (match?.[1] || '').trim();
        if (!isValidProductId(productId)) {
          await b.api.sendMessage(chatId, '\u274C Invalid product ID format.');
          return NextResponse.json({ ok: true });
        }

        const product = await getProduct(productId);
        if (!product) {
          await b.api.sendMessage(chatId, '\u274C Creation not found or no longer available.');
          return NextResponse.json({ ok: true });
        }

        if (String(product.creator_id) === String(userId)) {
          await b.api.sendMessage(chatId, '\u{1F937} That\'s your own product!');
          return NextResponse.json({ ok: true });
        }

        if (!(await hasPurchased(productId, userId))) {
          const starsPaid = Number(product.price_stars || 0);
          const platformFee = Math.ceil(starsPaid * PLATFORM_FEE_PERCENT / 100);
          const creatorShare = starsPaid - platformFee;
          const fakeChargeId = `test_${productId}_${userId}_${Date.now()}`;
          await recordPurchase(productId, userId, starsPaid, creatorShare, platformFee, fakeChargeId);
        }

        const title = String(product.title || 'Creation');
        let contentMessage = '';
        switch (product.content_type) {
          case 'text':
            contentMessage = `🧪 Test purchase successful\n\n${title}\n\n${product.content}`;
            break;
          case 'link':
            contentMessage = `🧪 Test purchase successful\n\n${title}\n\n🔗 ${product.content}`;
            break;
          case 'file':
            contentMessage = `🧪 Test purchase successful\n\n${title}`;
            break;
          default:
            contentMessage = `🧪 Test purchase successful\n\n${title}\n\n${product.content}`;
            break;
        }

        await b.api.sendMessage(chatId, contentMessage);
        if (product.content_type === 'file') {
          await deliverPaidMedia(b.api, chatId, product);
        }

        const creatorShare = Math.max(0, Number(product.price_stars || 0) - Math.ceil(Number(product.price_stars || 0) * PLATFORM_FEE_PERCENT / 100));
        const creatorMsg = `🧪 Test sale\n${title}\nSimulated buyer generated ⭐ ${creatorShare} creator share`;
        await b.api.sendMessage(product.creator_id, creatorMsg).catch(() => {});
      }

      // /admin_disable <id> and /admin_enable <id>
      else if (text.startsWith('/admin_disable ') || text.startsWith('/admin_enable ')) {
        if (!ADMIN_TELEGRAM_IDS.has(userId)) {
          await b.api.sendMessage(chatId, '\u274C Admin only command.');
          await logAdminAction(userId, 'toggle_product', 'product', null, 'forbidden');
          return NextResponse.json({ ok: true });
        }

        const enable = text.startsWith('/admin_enable ');
        const productId = text.slice(enable ? 14 : 15).trim();
        if (!isValidProductId(productId)) {
          await b.api.sendMessage(chatId, '\u274C Invalid product ID format.');
          await logAdminAction(userId, enable ? 'enable_product' : 'disable_product', 'product', productId, 'invalid_input');
          return NextResponse.json({ ok: true });
        }

        const updated = await setProductActive(productId, enable);
        await logAdminAction(userId, enable ? 'enable_product' : 'disable_product', 'product', productId, updated ? 'ok' : 'not_found');
        await b.api.sendMessage(chatId, updated
          ? `\u2705 Creation ${enable ? 'enabled' : 'disabled'}: \`${productId}\``
          : '\u274C Creation not found.', { parse_mode: 'MarkdownV2' });
      }

      // /products
      else if (text === '/products') {
        const products = await getCreatorProducts(userId);
        if (products.length === 0) {
          await b.api.sendMessage(chatId, 'No products yet\\. Use /create to make one\\!', { parse_mode: 'MarkdownV2' });
        } else {
          const list = products.map(p =>
            `\u{1F4E6} *${escapeMarkdown(p.title)}* \\— \u2B50 ${p.price_stars} Stars\n   \u{1F194} \`${p.id}\` \\| ${p.sales_count} sales`
          ).join('\n\n');
          await b.api.sendMessage(chatId, `\u{1F4CB} *Your products:*\n\n${list}`, { parse_mode: 'MarkdownV2' });
        }
      }

      // /dashboard
      else if (text === '/dashboard') {
        const stats = await getCreatorStats(userId);
        await b.api.sendMessage(chatId,
          `\u{1F4CA} *Your Dashboard*\n\n` +
          `\u{1F4E6} Creations: ${stats.products}\n` +
          `\u{1F6D2} Total sales: ${stats.sales}\n` +
          `\u2B50 Total earned: ${stats.totalStars} Stars\n\n` +
          `_Open the Mini App for detailed analytics_`,
          {
            parse_mode: 'MarkdownV2',
            reply_markup: {
              inline_keyboard: [[
                { text: '\u{1F4CA} Full Dashboard', web_app: { url: `${WEBAPP_URL}/dashboard` } }
              ]]
            }
          }
        );
      }
    }

    // Handle media messages (for /attach flow) — uses DB-backed pending attach state
    if (body.message && !body.message.text) {
      const chatId = body.message.chat.id;
      const userId = String(body.message.from.id);

      let fileId = null;
      let fileKind = 'document';
      if (body.message.document?.file_id) {
        fileId = body.message.document.file_id;
        fileKind = 'document';
      } else if (Array.isArray(body.message.photo) && body.message.photo.length > 0) {
        fileId = body.message.photo[body.message.photo.length - 1].file_id;
        fileKind = 'photo';
      } else if (body.message.video?.file_id) {
        fileId = body.message.video.file_id;
        fileKind = 'video';
      }

      if (fileId) {
        // Look up pending attach for this chat from DB
        const pendingProductId = await getPendingAttach(chatId);
        if (pendingProductId) {
          try {
            const product = await getProductRaw(pendingProductId);

            if (!product || product.creator_id !== userId) {
              await b.api.sendMessage(chatId, '❌ Unable to attach media. Creation not found or not yours.');
              await clearPendingAttach(chatId);
              return NextResponse.json({ ok: true });
            }

            const attached = await attachFileToProduct(pendingProductId, fileId, fileKind);
            if (attached) {
              await b.api.sendMessage(chatId, `✅ Media attached to "${product.title}"!`);
              await clearPendingAttach(chatId);
            } else {
              await b.api.sendMessage(chatId, '❌ Failed to attach. This creation type does not support file attachments.');
            }
            return NextResponse.json({ ok: true });
          } catch (attachErr) {
            console.error('Attach media error:', attachErr);
            try {
              await b.api.sendMessage(chatId, `❌ Failed to attach media: ${sanitizeErrorMessage(attachErr?.message, 'unknown error')}. Please try again.`);
            } catch {}
            return NextResponse.json({ ok: true });
          }
        }
      }
    }
  } catch (err) {
    console.error('Webhook error:', err);
    try {
      const chatId = body?.message?.chat?.id;
      if (chatId) {
        await getBot().api.sendMessage(chatId, '❌ Something went wrong. Please try again later.');
      }
    } catch {}
  }

  return NextResponse.json({ ok: true });
}
