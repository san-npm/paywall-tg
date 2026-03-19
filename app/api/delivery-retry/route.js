import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { Bot } from 'grammy';
import { BOT_TOKEN, ADMIN_TELEGRAM_IDS } from '@/lib/config';
import { getPendingDeliveries, getProduct, markDeliveryDone, markDeliveryFailed, getFailedDeliveries } from '@/lib/db';
import { escapeMarkdown } from '@/lib/validate';

export const runtime = 'nodejs';

let bot;
function getBot() {
  if (!bot) bot = new Bot(BOT_TOKEN);
  return bot;
}

function safeCompare(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function verifyCronAuth(req) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return false;

  const cronSecret = req.headers.get('x-cron-secret');
  if (cronSecret && safeCompare(cronSecret, expectedSecret)) return true;

  const authHeader = req.headers.get('authorization');
  const bearerPrefix = 'Bearer ';
  if (authHeader && authHeader.startsWith(bearerPrefix)) {
    const token = authHeader.slice(bearerPrefix.length);
    if (safeCompare(token, expectedSecret)) return true;
  }

  return false;
}

async function deliverContent(api, buyerId, product) {
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

  await api.sendMessage(buyerId, contentMessage, { parse_mode: 'MarkdownV2' });

  if (product.content_type === 'file' && product.file_id) {
    const kind = String(product.file_kind || 'document');
    if (kind === 'photo') {
      await api.sendPhoto(buyerId, product.file_id);
    } else if (kind === 'video') {
      await api.sendVideo(buyerId, product.file_id);
    } else {
      await api.sendDocument(buyerId, product.file_id);
    }
  }
}

async function processDeliveryQueue() {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
  }

  const deliveries = await getPendingDeliveries(10);
  const b = getBot();
  const results = [];

  for (const delivery of deliveries) {
    try {
      const product = await getProduct(delivery.product_id);
      if (!product) {
        await markDeliveryFailed(delivery.id, 'Product not found or inactive');
        results.push({ id: delivery.id, status: 'failed', error: 'product_not_found' });
        continue;
      }

      await deliverContent(b.api, String(delivery.buyer_telegram_id), product);
      await markDeliveryDone(delivery.id);
      results.push({ id: delivery.id, status: 'done' });
    } catch (err) {
      await markDeliveryFailed(delivery.id, err?.message || 'Unknown error');
      results.push({ id: delivery.id, status: 'retry', error: err?.message });

      // If all retries exhausted, notify admins
      if (Number(delivery.attempts) + 1 >= Number(delivery.max_attempts)) {
        for (const adminId of ADMIN_TELEGRAM_IDS) {
          b.api.sendMessage(adminId,
            `\u26A0\uFE0F Delivery permanently failed\nProduct: ${delivery.product_id}\nBuyer: ${delivery.buyer_telegram_id}\nError: ${String(err?.message || '').slice(0, 200)}`
          ).catch(() => {});
        }
      }
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

/**
 * GET /api/delivery-retry — Vercel Cron handler + failed deliveries list.
 * Vercel crons send GET with Authorization: Bearer <CRON_SECRET>.
 * With ?action=list, returns failed deliveries instead.
 */
export async function GET(req) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('action') === 'list') {
    const failed = await getFailedDeliveries(50);
    return NextResponse.json({ failed });
  }

  // Default: process the delivery queue (cron behavior)
  return processDeliveryQueue();
}

/**
 * POST /api/delivery-retry — manual trigger for processing delivery queue.
 */
export async function POST(req) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return processDeliveryQueue();
}
