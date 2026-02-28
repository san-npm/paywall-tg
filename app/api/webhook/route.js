import { NextResponse } from 'next/server';
import { Bot } from 'grammy';
import { v4 as uuid } from 'uuid';
import { BOT_TOKEN, WEBAPP_URL, PLATFORM_FEE_PERCENT } from '@/lib/config';
import { 
  getOrCreateCreator, createProduct, getProduct, getCreatorProducts, 
  getCreatorStats, recordPurchase, hasPurchased 
} from '@/lib/db';

let bot;
function getBot() {
  if (!bot) bot = new Bot(BOT_TOKEN);
  return bot;
}

export async function POST(req) {
  if (!BOT_TOKEN) return NextResponse.json({ error: 'BOT_TOKEN not set' }, { status: 500 });
  
  const body = await req.json();
  const b = getBot();

  try {
    // Handle pre_checkout_query (must respond within 10 seconds)
    if (body.pre_checkout_query) {
      const query = body.pre_checkout_query;
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
        const starsPaid = payment.total_amount;
        const platformFee = Math.ceil(starsPaid * PLATFORM_FEE_PERCENT / 100);
        const creatorShare = starsPaid - platformFee;
        
        recordPurchase(productId, buyerId, starsPaid, creatorShare, platformFee, payment.telegram_payment_charge_id);
        
        // Deliver the content
        let contentMessage = '';
        switch (product.content_type) {
          case 'text':
            contentMessage = `🎉 *Purchase successful!*\n\n*${product.title}*\n\n${product.content}`;
            break;
          case 'link':
            contentMessage = `🎉 *Purchase successful!*\n\n*${product.title}*\n\n🔗 ${product.content}`;
            break;
          case 'file':
            contentMessage = `🎉 *Purchase successful!*\n\n*${product.title}*`;
            break;
          case 'message':
            contentMessage = `🎉 *Purchase successful!*\n\n*${product.title}*\n\n${product.content}`;
            break;
        }
        
        await b.api.sendMessage(buyerId, contentMessage, { parse_mode: 'Markdown' });
        
        // If file, send the file
        if (product.content_type === 'file' && product.file_id) {
          await b.api.sendDocument(buyerId, product.file_id);
        }
        
        // Notify creator
        await b.api.sendMessage(product.creator_id, 
          `💰 New sale!\n*${product.title}*\nBuyer earned you ⭐ ${creatorShare} Stars`, 
          { parse_mode: 'Markdown' }
        ).catch(() => {});
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
          `👋 Welcome to *PayGate*!\n\nSell digital content directly in Telegram.\n\n` +
          `📦 /create — Create a new product\n` +
          `📊 /dashboard — View your stats\n` +
          `📋 /products — List your products\n` +
          `🛒 /buy <id> — Buy a product\n\n` +
          `Or open the Mini App 👇`,
          { 
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: '🚀 Open PayGate', web_app: { url: WEBAPP_URL } }
              ]]
            }
          }
        );
      }

      // /create command  
      else if (text === '/create') {
        getOrCreateCreator(userId, msg.from.username, msg.from.first_name);
        await b.api.sendMessage(chatId,
          `📦 *Create a product*\n\nOpen the Mini App to create your product with a nice UI, or use the quick command:\n\n` +
          `\`/new <price_in_stars> <title> | <content>\`\n\n` +
          `Example:\n\`/new 50 My Secret Guide | Here's the secret content that buyers will receive...\``,
          { 
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: '📦 Create in App', web_app: { url: `${WEBAPP_URL}/create` } }
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
          await b.api.sendMessage(chatId, '❌ Format: `/new <price> <title> | <content>`', { parse_mode: 'Markdown' });
          return NextResponse.json({ ok: true });
        }
        
        const price = parseInt(priceMatch[1]);
        const title = priceMatch[2].trim();
        const content = priceMatch[3].trim();
        
        if (price < 1 || price > 10000) {
          await b.api.sendMessage(chatId, '❌ Price must be between 1 and 10,000 Stars');
          return NextResponse.json({ ok: true });
        }
        
        getOrCreateCreator(userId, msg.from.username, msg.from.first_name);
        const id = uuid().slice(0, 8);
        createProduct(id, userId, title, '', price, 'text', content, null);
        
        const shareUrl = `https://t.me/${(await b.api.getMe()).username}?start=buy_${id}`;
        await b.api.sendMessage(chatId,
          `✅ *Product created!*\n\n` +
          `📦 *${title}*\n⭐ ${price} Stars\n🆔 \`${id}\`\n\n` +
          `Share this link:\n${shareUrl}`,
          { parse_mode: 'Markdown' }
        );
      }

      // /start buy_<id> (deep link)
      else if (text.startsWith('/start buy_')) {
        const productId = text.slice(11).trim();
        const product = getProduct(productId);
        
        if (!product) {
          await b.api.sendMessage(chatId, '❌ Product not found or no longer available.');
          return NextResponse.json({ ok: true });
        }
        
        if (hasPurchased(productId, userId)) {
          await b.api.sendMessage(chatId, '✅ You already purchased this! The content was sent to you.');
          return NextResponse.json({ ok: true });
        }
        
        if (product.creator_id === userId) {
          await b.api.sendMessage(chatId, '🤷 That\'s your own product!');
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
          await b.api.sendMessage(chatId, '❌ Product not found or no longer available.');
          return NextResponse.json({ ok: true });
        }
        
        // Check if already purchased
        if (hasPurchased(productId, userId)) {
          await b.api.sendMessage(chatId, '✅ You already purchased this! The content was sent to you.');
          return NextResponse.json({ ok: true });
        }
        
        // Check if creator is buying their own product
        if (product.creator_id === userId) {
          await b.api.sendMessage(chatId, '🤷 That\'s your own product!');
          return NextResponse.json({ ok: true });
        }
        
        // Send invoice
        await b.api.sendInvoice(chatId, product.title, product.description || `Digital content by creator`, productId, 'XTR', [
          { label: product.title, amount: product.price_stars }
        ]);
      }

      // /products
      else if (text === '/products') {
        const products = getCreatorProducts(userId);
        if (products.length === 0) {
          await b.api.sendMessage(chatId, 'No products yet. Use /create to make one!');
        } else {
          const list = products.map(p => 
            `📦 *${p.title}* — ⭐ ${p.price_stars} Stars\n   🆔 \`${p.id}\` | ${p.sales_count} sales`
          ).join('\n\n');
          await b.api.sendMessage(chatId, `📋 *Your products:*\n\n${list}`, { parse_mode: 'Markdown' });
        }
      }

      // /dashboard
      else if (text === '/dashboard') {
        const stats = getCreatorStats(userId);
        await b.api.sendMessage(chatId,
          `📊 *Your Dashboard*\n\n` +
          `📦 Products: ${stats.products}\n` +
          `🛒 Total sales: ${stats.sales}\n` +
          `⭐ Total earned: ${stats.totalStars} Stars\n\n` +
          `_Open the Mini App for detailed analytics_`,
          { 
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: '📊 Full Dashboard', web_app: { url: `${WEBAPP_URL}/dashboard` } }
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
