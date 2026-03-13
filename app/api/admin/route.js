import { NextResponse } from 'next/server';
import { Bot } from 'grammy';
import { ADMIN_TELEGRAM_IDS, BOT_TOKEN } from '@/lib/config';
import { validateInitData, isValidProductId } from '@/lib/validate';
import { setProductActive, logAdminAction, getAdminActions, getPurchaseExports, getPurchaseByChargeId, markPurchaseRefundedByChargeId, getPayoutQueue, createPayoutsFromUnassigned, markPayoutPaid, markPayoutProcessing, getPayoutDetails, getMonthlyReconciliation } from '@/lib/db';

export const runtime = 'nodejs';

let bot;
function getBot() {
  if (!bot) bot = new Bot(BOT_TOKEN);
  return bot;
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

function payoutStatementRows(details) {
  if (!details?.payout) return [];
  const header = details.payout;
  const rows = (details.purchases || []).map((p) => ({
    payout_id: header.id,
    payout_created_at: header.created_at,
    payout_status: header.status,
    payout_paid_at: header.paid_at || '',
    creator_id: header.creator_id,
    payout_amount_stars: header.amount_stars,
    invoice_ref: header.invoice_ref || '',
    purchase_id: p.id,
    product_id: p.product_id,
    product_title: p.product_title || '',
    buyer_telegram_id: p.buyer_telegram_id,
    stars_paid: p.stars_paid,
    creator_share: p.creator_share,
    platform_fee: p.platform_fee,
    refunded: p.refunded,
    telegram_charge_id: p.telegram_charge_id || '',
    purchase_created_at: p.created_at,
  }));

  if (rows.length > 0) return rows;

  return [{
    payout_id: header.id,
    payout_created_at: header.created_at,
    payout_status: header.status,
    payout_paid_at: header.paid_at || '',
    creator_id: header.creator_id,
    payout_amount_stars: header.amount_stars,
    invoice_ref: header.invoice_ref || '',
    purchase_id: '',
    product_id: '',
    product_title: '',
    buyer_telegram_id: '',
    stars_paid: '',
    creator_share: '',
    platform_fee: '',
    refunded: '',
    telegram_charge_id: '',
    purchase_created_at: '',
  }];
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

  if (kind === 'payout_statement_csv') {
    const payoutIdNum = Number(payout_id);
    if (!Number.isFinite(payoutIdNum) || payoutIdNum <= 0) {
      return NextResponse.json({ error: 'Valid payout_id required' }, { status: 400 });
    }
    const details = await getPayoutDetails(payoutIdNum);
    if (!details?.payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }
    const csv = toCsv(payoutStatementRows(details));
    const filename = `payout-statement-${payoutIdNum}.csv`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
      },
    });
  }

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
  const adminId = getAdminId(req);
  if (!adminId) return NextResponse.json({ error: 'Admin required' }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = String(body.action || '').trim();

  if (action === 'disable_product' || action === 'enable_product') {
    const productId = String(body.product_id || '').trim();
    if (!isValidProductId(productId)) {
      return NextResponse.json({ error: 'Invalid product_id' }, { status: 400 });
    }

    const enable = action === 'enable_product';
    const ok = await setProductActive(productId, enable);
    await logAdminAction(adminId, action, 'product', productId, ok ? 'ok' : 'not_found');

    if (!ok) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'refund_payment') {
    const buyerId = String(body.buyer_telegram_id || '').trim();
    const chargeId = String(body.telegram_charge_id || '').trim();

    if (!buyerId || !chargeId) {
      return NextResponse.json({ error: 'buyer_telegram_id and telegram_charge_id are required' }, { status: 400 });
    }

    const purchase = await getPurchaseByChargeId(chargeId);
    if (!purchase) {
      await logAdminAction(adminId, action, 'payment', chargeId, 'not_found', { buyerId });
      return NextResponse.json({ error: 'Charge not found' }, { status: 404 });
    }

    if (Number(purchase.refunded) === 1) {
      return NextResponse.json({ error: 'Already refunded' }, { status: 400 });
    }

    try {
      const b = getBot();
      await b.api.refundStarPayment(buyerId, chargeId);
      await markPurchaseRefundedByChargeId(chargeId);
      await logAdminAction(adminId, action, 'payment', chargeId, 'ok', { buyerId });
      return NextResponse.json({ ok: true });
    } catch (err) {
      await logAdminAction(adminId, action, 'payment', chargeId, 'error', { buyerId, error: err?.message || 'unknown' });
      console.error('refund_payment failed:', err);
      return NextResponse.json({ error: 'Refund failed' }, { status: 500 });
    }
  }

  if (action === 'payout_create') {
    const creatorId = body.creator_id ? String(body.creator_id) : null;
    const created = await createPayoutsFromUnassigned(creatorId);
    await logAdminAction(adminId, action, 'payout', creatorId, 'ok', { created: created.length });
    return NextResponse.json({ ok: true, created });
  }

  if (action === 'payout_mark_processing' || action === 'payout_mark_paid') {
    const payoutId = Number(body.payout_id);
    if (!Number.isFinite(payoutId) || payoutId <= 0) {
      return NextResponse.json({ error: 'Valid payout_id required' }, { status: 400 });
    }
    const ok = action === 'payout_mark_processing'
      ? await markPayoutProcessing(payoutId)
      : await markPayoutPaid(payoutId);
    await logAdminAction(adminId, action, 'payout', String(payoutId), ok ? 'ok' : 'not_found');
    if (!ok) return NextResponse.json({ error: 'Payout not found or invalid status transition' }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
