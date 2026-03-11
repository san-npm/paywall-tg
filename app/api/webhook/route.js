import { NextResponse } from 'next/server';
import { Bot } from 'grammy';
import { v4 as uuid } from 'uuid';
import { BOT_TOKEN, WEBAPP_URL, PLATFORM_FEE_PERCENT, MAX_PRICE_STARS, ADMIN_TELEGRAM_IDS, TELEGRAM_CURRENCY } from '@/lib/config';
import {
  getOrCreateCreator, createProduct, getProduct, getProductRaw, getCreatorProducts,
  getCreatorStats, recordPurchase, hasPurchased, markPurchaseRefunded, attachFileToProduct, markUpdateProcessed, setProductActive, logAdminAction
} from '@/lib/db';
import { verifyWebhookSecret, escapeMarkdown, parseNewCommand, isValidProductId } from '@/lib/validate';

export const runtime = 'nodejs';


let bot;
function getBot() {
  if (!bot) bot = new Bot(BOT_TOKEN);
  return bot;
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
        await b.api.answerPreCheckoutQuery(query.id, false, { error_message: 'Product no longer available.' });
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
      if (product.creator_id === buyerId) {
        await b.api.answerPreCheckoutQuery(query.id, false, { error_message: 'You cannot buy your own product.' });
        return NextResponse.json({ ok: true });
      }
      // Prevent duplicate purchase
      if (await hasPurchased(productId, buyerId)) {
        await b.api.answerPreCheckoutQuery(query.id, false, { error_message: 'You already purchased this product.' });
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

        // Guard against duplicate delivery
        if (await hasPurchased(productId, buyerId)) {
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

        // If file type with a stored file_id, send the file
        if (product.content_type === 'file') {
          if (product.file_id) {
            await b.api.sendDocument(buyerId, product.file_id);
          } else {
            await b.api.sendMessage(buyerId, 'The file for this product is not yet available. Contact the creator.');
          }
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
        await getOrCreateCreator(userId, msg.from.username, msg.from.first_name);
        await b.api.sendMessage(chatId,
          `\u{1F44B} Welcome to *Gategram*\\!\n\nSell digital content directly in Telegram\\.\n\n` +
          `\u{1F4E6} /create \\— Create a new product\n` +
          `\u{1F4CA} /dashboard \\— View your stats\n` +
          `\u{1F4CB} /products \\— List your products\n` +
          `\u{1F6D2} /buy \\<id\\> \\— Buy a product\n` +
          `\u{1F4CE} /attach \\<id\\> \\— Attach a file to a product\n\n` +
          `Or open the Mini App \u{1F447}`,
          {
            parse_mode: 'MarkdownV2',
            reply_markup: {
              inline_keyboard: [[
                { text: '\u{1F680} Open Gategram', web_app: { url: WEBAPP_URL } }
              ]]
            }
          }
        );
      }

      // /create command
      else if (text === '/create') {
        await getOrCreateCreator(userId, msg.from.username, msg.from.first_name);
        await b.api.sendMessage(chatId,
          `\u{1F4E6} *Create a product*\n\nOpen the Mini App to create your product with a nice UI, or use the quick command:\n\n` +
          `\`/new <price_in_stars> <title> | <content>\`\n\n` +
          `Example:\n\`/new 50 My Secret Guide | Here's the secret content that buyers will receive\\.\\.\\.\``,
          {
            parse_mode: 'MarkdownV2',
            reply_markup: {
              inline_keyboard: [[
                { text: '\u{1F4E6} Create in App', web_app: { url: `${WEBAPP_URL}/create` } }
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
        await getOrCreateCreator(userId, msg.from.username, msg.from.first_name);
        const id = uuid();
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
          await b.api.sendMessage(chatId, '\u274C Product not found.');
          return NextResponse.json({ ok: true });
        }
        if (product.creator_id !== userId) {
          await b.api.sendMessage(chatId, '\u274C You can only attach files to your own products.');
          return NextResponse.json({ ok: true });
        }
        if (product.content_type !== 'file') {
          await b.api.sendMessage(chatId, '\u274C This product is not a file type. Only file-type products accept file attachments.');
          return NextResponse.json({ ok: true });
        }

        // Store a pending attach state using reply markup
        await b.api.sendMessage(chatId,
          `\u{1F4CE} *Attach a file to:* ${escapeMarkdown(product.title)}\n\n` +
          `Reply to this message with the file you want to attach\\.\n` +
          `Product ID: \`${productId}\``,
          {
            parse_mode: 'MarkdownV2',
            reply_markup: { force_reply: true, selective: true, input_field_placeholder: 'Send or forward a file...' }
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
          await b.api.sendMessage(chatId, '\u274C Product not found or no longer available.');
          return NextResponse.json({ ok: true });
        }

        if (await hasPurchased(productId, userId)) {
          await b.api.sendMessage(chatId, '\u2705 You already purchased this! The content was sent to you.');
          return NextResponse.json({ ok: true });
        }

        if (product.creator_id === userId) {
          await b.api.sendMessage(chatId, '\u{1F937} That\'s your own product!');
          return NextResponse.json({ ok: true });
        }

        await b.api.sendInvoice(chatId, product.title, product.description || 'Digital content', productId, TELEGRAM_CURRENCY, [
          { label: product.title, amount: product.price_stars }
        ]);
      }

      // /buy <id>
      else if (text.startsWith('/buy ')) {
        const productId = text.slice(5).trim();
        if (!isValidProductId(productId)) {
          await b.api.sendMessage(chatId, '\u274C Invalid product ID format.');
          return NextResponse.json({ ok: true });
        }
        const product = await getProduct(productId);

        if (!product) {
          await b.api.sendMessage(chatId, '\u274C Product not found or no longer available.');
          return NextResponse.json({ ok: true });
        }

        if (await hasPurchased(productId, userId)) {
          await b.api.sendMessage(chatId, '\u2705 You already purchased this! The content was sent to you.');
          return NextResponse.json({ ok: true });
        }

        if (product.creator_id === userId) {
          await b.api.sendMessage(chatId, '\u{1F937} That\'s your own product!');
          return NextResponse.json({ ok: true });
        }

        await b.api.sendInvoice(chatId, product.title, product.description || 'Digital content by creator', productId, TELEGRAM_CURRENCY, [
          { label: product.title, amount: product.price_stars }
        ]);
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
          ? `\u2705 Product ${enable ? 'enabled' : 'disabled'}: \`${productId}\``
          : '\u274C Product not found.', { parse_mode: 'MarkdownV2' });
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
          `\u{1F4E6} Products: ${stats.products}\n` +
          `\u{1F6D2} Total sales: ${stats.sales}\n` +
          `\u2B50 Total earned: ${stats.totalStars} Stars\n\n` +
          `_Open the Mini App for detailed analytics_`,
          {
            parse_mode: 'MarkdownV2',
            reply_markup: {
              inline_keyboard: [[
                { text: '\u{1F4CA} Full Dashboard', web_app: { url: WEBAPP_URL } }
              ]]
            }
          }
        );
      }
    }

    // Handle document/file replies (for /attach flow)
    if (body.message?.document && body.message?.reply_to_message?.text) {
      const replyText = body.message.reply_to_message.text;
      const chatId = body.message.chat.id;
      const userId = String(body.message.from.id);
      const fileId = body.message.document.file_id;

      // Extract product ID from the /attach reply
      const match = replyText.match(/Product ID:\s*([a-f0-9-]{36})/i);
      if (match) {
        const productId = match[1];
        const product = await getProductRaw(productId);

        if (!product || product.creator_id !== userId) {
          await b.api.sendMessage(chatId, '\u274C Unable to attach file. Product not found or not yours.');
          return NextResponse.json({ ok: true });
        }

        const attached = await attachFileToProduct(productId, fileId);
        if (attached) {
          await b.api.sendMessage(chatId, `\u2705 File attached to *${escapeMarkdown(product.title)}*\\!`, { parse_mode: 'MarkdownV2' });
        } else {
          await b.api.sendMessage(chatId, '\u274C Failed to attach file. Make sure the product is a file type.');
        }
      }
    }
  } catch (err) {
    console.error('Webhook error:', err);
  }

  return NextResponse.json({ ok: true });
}
