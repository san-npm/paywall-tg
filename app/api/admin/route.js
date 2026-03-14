import { NextResponse } from 'next/server';
import { Bot } from 'grammy';
import { randomUUID } from 'crypto';
import { ADMIN_TELEGRAM_IDS, BOT_TOKEN } from '@/lib/config';
import { validateInitData, isValidProductId } from '@/lib/validate';
import { setProductActive, logAdminAction, getAdminActions, getPurchaseExports, getPurchaseByChargeId, markPurchaseRefundedByChargeId, getPayoutQueue, createPayoutsFromUnassigned, markPayoutPaid, getPayoutDetails, getMonthlyReconciliation } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

let bot;
function getBot() {
  if (!BOT_TOKEN) throw new Error('BOT_TOKEN missing');
  if (!bot) bot = new Bot(BOT_TOKEN);
  return bot;
}

function jsonWithRequestId(payload, requestId, status = 200) {
  return NextResponse.json({ ...payload, request_id: requestId }, { status });
}

function getAdminId(req) {
  const initData = req.headers.get('x-telegram-init-data') || '';
  const parsed = validateInitData(initData);
  const userId = parsed?.user?.id ? String(parsed.user.id) : null;
  if (!userId || !ADMIN_TELEGRAM_IDS.has(userId)) return null;
  return userId;
}

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) lines.push(headers.map(h => esc(row[h])).join(','));
  return `${lines.join('\n')}\n`;
}

export async function GET(req) {
  const adminId = getAdminId(req);
  if (!adminId) return NextResponse.json({ is_admin: false }, { status: 200 });

  const { searchParams } = new URL(req.url);
  const format = String(searchParams.get('format') || 'json');
  const kind = String(searchParams.get('kind') || 'actions');
  const limit = Number.parseInt(searchParams.get('limit') || '1000', 10);
  const fromRaw = searchParams.get('from') || undefined;
  const toRaw = searchParams.get('to') || undefined;
  const from = fromRaw ? `${fromRaw} 00:00:00` : undefined;
  const to = toRaw ? `${toRaw} 23:59:59` : undefined;
  const creator_id = searchParams.get('creator_id') || undefined;
  const refunded = searchParams.get('refunded') || undefined;
  const payout_id = searchParams.get('payout_id') || undefined;

  const filters = { limit, from, to, creator_id, refunded, payout_id };

  const rows = kind === 'purchases'
    ? await getPurchaseExports(filters)
    : kind === 'payouts'
      ? (await getPayoutQueue()).payouts
      : kind === 'reconciliation'
        ? await getMonthlyReconciliation({ from, to })
        : await getAdminActions(filters);

  if (format === 'csv') {
    const csv = toCsv(rows);
    const filename = `${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  if (kind === 'payouts' && format !== 'csv') {
    const queue = await getPayoutQueue();
    if (payout_id) {
      const details = await getPayoutDetails(Number(payout_id));
      return NextResponse.json({ is_admin: true, kind, filters, ...queue, details });
    }
    return NextResponse.json({ is_admin: true, kind, filters, ...queue });
  }

  return NextResponse.json({ is_admin: true, kind, filters, rows, actions: kind === 'actions' ? rows : undefined });
}

export async function POST(req) {
  const requestId = randomUUID();
  const adminId = getAdminId(req);
  if (!adminId) return jsonWithRequestId({ error: 'Admin required' }, requestId, 403);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonWithRequestId({ error: 'Invalid JSON body' }, requestId, 400);
  }

  const action = String(body.action || '').trim();

  if (action === 'disable_product' || action === 'enable_product') {
    const productId = String(body.product_id || '').trim();
    if (!isValidProductId(productId)) {
      return jsonWithRequestId({ error: 'Invalid product_id' }, requestId, 400);
    }

    const enable = action === 'enable_product';
    const ok = await setProductActive(productId, enable);
    await logAdminAction(adminId, action, 'product', productId, ok ? 'ok' : 'not_found', { requestId });

    if (!ok) return jsonWithRequestId({ error: 'Product not found' }, requestId, 404);
    return jsonWithRequestId({ ok: true }, requestId, 200);
  }

  if (action === 'refund_payment') {
    const buyerId = String(body.buyer_telegram_id || '').trim();
    const chargeId = String(body.telegram_charge_id || '').trim();

    if (!buyerId || !chargeId) {
      return jsonWithRequestId({ error: 'buyer_telegram_id and telegram_charge_id are required' }, requestId, 400);
    }

    const refundLimit = await checkRateLimit(`admin:${adminId}:refund_payment`, 20);
    if (refundLimit.limited) {
      await logAdminAction(adminId, action, 'payment', chargeId || null, 'rate_limited', { buyerId, requestId });
      return jsonWithRequestId({ error: 'Rate limit exceeded for refunds' }, requestId, 429);
    }

    const purchase = await getPurchaseByChargeId(chargeId);
    if (!purchase) {
      await logAdminAction(adminId, action, 'payment', chargeId, 'not_found', { buyerId, requestId });
      return jsonWithRequestId({ error: 'Charge not found' }, requestId, 404);
    }

    if (Number(purchase.refunded) === 1) {
      return jsonWithRequestId({ error: 'Already refunded' }, requestId, 400);
    }

    try {
      const b = getBot();
      await b.api.refundStarPayment(buyerId, chargeId);
      await markPurchaseRefundedByChargeId(chargeId);
      await logAdminAction(adminId, action, 'payment', chargeId, 'ok', { buyerId, requestId });
      return jsonWithRequestId({ ok: true }, requestId, 200);
    } catch (err) {
      await logAdminAction(adminId, action, 'payment', chargeId, 'error', { buyerId, error: err?.message || 'unknown', requestId });
      console.error('refund_payment failed:', { requestId, err });
      return jsonWithRequestId({ error: 'Refund failed' }, requestId, 500);
    }
  }

  if (action === 'payout_create') {
    const payoutCreateLimit = await checkRateLimit(`admin:${adminId}:payout_create`, 30);
    if (payoutCreateLimit.limited) {
      await logAdminAction(adminId, action, 'payout', body.creator_id ? String(body.creator_id) : null, 'rate_limited', { requestId });
      return jsonWithRequestId({ error: 'Rate limit exceeded for payout_create' }, requestId, 429);
    }
    const creatorId = body.creator_id ? String(body.creator_id) : null;
    const created = await createPayoutsFromUnassigned(creatorId);
    await logAdminAction(adminId, action, 'payout', creatorId, 'ok', { created: created.length, requestId });
    return jsonWithRequestId({ ok: true, created }, requestId, 200);
  }

  if (action === 'payout_mark_paid') {
    const payoutPaidLimit = await checkRateLimit(`admin:${adminId}:payout_mark_paid`, 120);
    if (payoutPaidLimit.limited) {
      await logAdminAction(adminId, action, 'payout', body.payout_id ? String(body.payout_id) : null, 'rate_limited', { requestId });
      return jsonWithRequestId({ error: 'Rate limit exceeded for payout_mark_paid' }, requestId, 429);
    }
    const payoutId = Number(body.payout_id);
    if (!Number.isFinite(payoutId) || payoutId <= 0) {
      return jsonWithRequestId({ error: 'Valid payout_id required' }, requestId, 400);
    }
    const ok = await markPayoutPaid(payoutId);
    await logAdminAction(adminId, action, 'payout', String(payoutId), ok ? 'ok' : 'not_found', { requestId });
    if (!ok) return jsonWithRequestId({ error: 'Payout not found or already paid' }, requestId, 404);
    return jsonWithRequestId({ ok: true }, requestId, 200);
  }

  return jsonWithRequestId({ error: 'Unsupported action' }, requestId, 400);
}
