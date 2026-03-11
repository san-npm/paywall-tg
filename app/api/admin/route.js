import { NextResponse } from 'next/server';
import { Bot } from 'grammy';
import { ADMIN_TELEGRAM_IDS, BOT_TOKEN } from '@/lib/config';
import { validateInitData, isValidProductId } from '@/lib/validate';
import { setProductActive, logAdminAction, getAdminActions, getPurchaseExports, getPurchaseByChargeId, markPurchaseRefundedByChargeId } from '@/lib/db';

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

export async function GET(req) {
  const adminId = getAdminId(req);
  if (!adminId) return NextResponse.json({ is_admin: false }, { status: 200 });

  const { searchParams } = new URL(req.url);
  const format = String(searchParams.get('format') || 'json');
  const kind = String(searchParams.get('kind') || 'actions');
  const limit = Number.parseInt(searchParams.get('limit') || '1000', 10);

  const rows = kind === 'purchases'
    ? await getPurchaseExports(limit)
    : await getAdminActions(limit);

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

  return NextResponse.json({ is_admin: true, kind, rows, actions: kind === 'actions' ? rows : undefined });
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

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
