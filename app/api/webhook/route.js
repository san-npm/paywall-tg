import { NextResponse } from 'next/server';
import { Bot } from 'grammy';
import { v4 as uuid } from 'uuid';
import { BOT_TOKEN, WEBAPP_URL, PLATFORM_FEE_PERCENT } from '@/lib/config';
import {
  getOrCreateCreator, createProduct, getProduct, getCreatorProducts,
  getCreatorStats, recordPurchase, hasPurchased
} from '@/lib/db';
import { verifyWebhookSecret, escapeMarkdown } from '@/lib/validate';

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

  const body = await req.json();
  const b = getBot();

  try {
    // Handle pre_checkout_query (must respond within 10 seconds)
    if (body.pre_checkout_query) {
      const query = body.pre_checkout_query;
      const productId = query.invoice_payload;
      const product = getProduct(productId);

      // Validate product exists and price matches
      if (!product) {
        await b.api.answerPreCheckoutQuery(query.id, false, { error_message: 'Product no longer available.' });
        return NextResponse.json({ ok: true });
      }
      if (query.total_amount !== product.price_stars) {
        await b.api.answerPreCheckoutQuery(query.id, false, { error_message: 'Price has changed. Please try again.' });
        return NextResponse.json({ ok: true });
      }

      await b.api.answerPreCheckoutQuery(query.id, true);
      return NextResponse.json({ ok: true });
    }

    // Handle successful payment
    if (body.message?.successful_payment) {
      const payment = body.message.successful_payment;
      const buyerId = String(body.message.from.id);
      const productId = payment.invoice_payload;
      const product = getProduct(productId);

      if (product) {
        // Verify payment amount matches product price
        if (payment.total_amount !== product.price_stars) {
          console.error('Payment amount mismatch', { expected: product.price_stars, got: payment.total_amount });
          return NextResponse.json({ ok: true });
        }

        // Guard against duplicate delivery (DB has UNIQUE constraint too)
        if (hasPurchased(productId, buyerId)) {
          return NextResponse.json({ ok: true });
        }

        const starsPaid = payment.total_amount;
        const platformFee = Math.ceil(starsPaid * PLATFORM_FEE_PERCENT / 100);
        const creatorShare = starsPaid - platformFee;

        try {
          recordPurchase(productId, buyerId, starsPaid, creatorShare, platformFee, payment.telegram_payment_charge_id);
        } catch (err) {
          // UNIQUE constraint violation = duplicate, silently skip
          if (err.message?.includes('UNIQUE constraint')) {
            return NextResponse.json({ ok: true });
          }
          throw err;
        }

        // Deliver the content — escape user-controlled text for MarkdownV2
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

        // If file, send the file
        if (product.content_type === 'file' && product.file_id) {
          await b.api.sendDocument(buyerId, product.file_id);
        }

        // Notify creator
        const creatorMsg = `\u{1F4B0} New sale\\!\n*${safeTitle}*\nBuyer earned you \u2B50 ${creatorShare} Stars`;
        await b.api.sendMessage(product.creator_id, creatorMsg, { parse_mode: 'MarkdownV2' }).catch(() => {});
      }

      return NextResponse.json({ ok: true });
    }

    // Handle messages
    if (body.message?.text) {
      const msg = body.message;
      const chatId = msg.chat.id;
      const userId = String(msg.from.id);
      const text = msg.text;

      // /start command
      if (text === '/start') {
        getOrCreateCreator(userId, msg.from.username, msg.from.first_name);
        await b.api.sendMessage(chatId,
          `\u{1F44B} Welcome to *PayGate*\\!\n\nSell digital content directly in Telegram\\.\n\n` +
          `\u{1F4E6} /create \\— Create a new product\n` +
          `\u{1F4CA} /dashboard \\— View your stats\n` +
          `\u{1F4CB} /products \\— List your products\n` +
          `\u{1F6D2} /buy \\<id\\> \\— Buy a product\n\n` +
          `Or open the Mini App \u{1F447}`,
          {
            parse_mode: 'MarkdownV2',
            reply_markup: {
              inline_keyboard: [[
                { text: '\u{1F680} Open PayGate', web_app: { url: WEBAPP_URL } }
              ]]
            }
          }
        );
      }

      // /create command
      else if (text === '/create') {
        getOrCreateCreator(userId, msg.from.username, msg.from.first_name);
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
        const parts = text.slice(5);
        const priceMatch = parts.match(/^(\d+)\s+(.+?)\s*\|\s*(.+)$/s);

        if (!priceMatch) {
          await b.api.sendMessage(chatId, '\u274C Format: `/new <price> <title> | <content>`', { parse_mode: 'MarkdownV2' });
          return NextResponse.json({ ok: true });
        }

        const price = parseInt(priceMatch[1]);
        const title = priceMatch[2].trim();
        const content = priceMatch[3].trim();

        if (price < 1 || price > 10000) {
          await b.api.sendMessage(chatId, '\u274C Price must be between 1 and 10,000 Stars');
          return NextResponse.json({ ok: true });
        }

        if (title.length > 100) {
          await b.api.sendMessage(chatId, '\u274C Title must be 100 characters or less');
          return NextResponse.json({ ok: true });
        }

        if (content.length > 3800) {
          await b.api.sendMessage(chatId, '\u274C Content must be 3800 characters or less');
          return NextResponse.json({ ok: true });
        }

        getOrCreateCreator(userId, msg.from.username, msg.from.first_name);
        const id = uuid();
        createProduct(id, userId, title, '', price, 'text', content, null);

        const shareUrl = `https://t.me/${(await b.api.getMe()).username}?start=buy_${id}`;
        const safeTitle = escapeMarkdown(title);
        await b.api.sendMessage(chatId,
          `\u2705 *Product created\\!*\n\n` +
          `\u{1F4E6} *${safeTitle}*\n\u2B50 ${price} Stars\n\u{1F194} \`${id}\`\n\n` +
          `Share this link:\n${escapeMarkdown(shareUrl)}`,
          { parse_mode: 'MarkdownV2' }
        );
      }

      // /start buy_<id> (deep link)
      else if (text.startsWith('/start buy_')) {
        const productId = text.slice(11).trim();
        const product = getProduct(productId);

        if (!product) {
          await b.api.sendMessage(chatId, '\u274C Product not found or no longer available.');
          return NextResponse.json({ ok: true });
        }

        if (hasPurchased(productId, userId)) {
          await b.api.sendMessage(chatId, '\u2705 You already purchased this! The content was sent to you.');
          return NextResponse.json({ ok: true });
        }

        if (product.creator_id === userId) {
          await b.api.sendMessage(chatId, '\u{1F937} That\'s your own product!');
          return NextResponse.json({ ok: true });
        }

        await b.api.sendInvoice(chatId, product.title, product.description || 'Digital content', productId, 'XTR', [
          { label: product.title, amount: product.price_stars }
        ]);
      }

      // /buy <id>
      else if (text.startsWith('/buy ')) {
        const productId = text.slice(5).trim();
        const product = getProduct(productId);

        if (!product) {
          await b.api.sendMessage(chatId, '\u274C Product not found or no longer available.');
          return NextResponse.json({ ok: true });
        }

        if (hasPurchased(productId, userId)) {
          await b.api.sendMessage(chatId, '\u2705 You already purchased this! The content was sent to you.');
          return NextResponse.json({ ok: true });
        }

        if (product.creator_id === userId) {
          await b.api.sendMessage(chatId, '\u{1F937} That\'s your own product!');
          return NextResponse.json({ ok: true });
        }

        await b.api.sendInvoice(chatId, product.title, product.description || 'Digital content by creator', productId, 'XTR', [
          { label: product.title, amount: product.price_stars }
        ]);
      }

      // /products
      else if (text === '/products') {
        const products = getCreatorProducts(userId);
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
        const stats = getCreatorStats(userId);
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
                { text: '\u{1F4CA} Full Dashboard', web_app: { url: `${WEBAPP_URL}/dashboard` } }
              ]]
            }
          }
        );
      }
    }
  } catch (err) {
    console.error('Webhook error:', err);
  }

  return NextResponse.json({ ok: true });
}
