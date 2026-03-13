import { NextResponse } from 'next/server';
import { getCreatorPayoutDetails } from '@/lib/db';
import { validateInitData } from '@/lib/validate';

export const runtime = 'nodejs';

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) lines.push(headers.map((h) => esc(row[h])).join(','));
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

  return rows.length ? rows : [{
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
  const initDataRaw = req.headers.get('x-telegram-init-data') || '';
  const initData = validateInitData(initDataRaw);
  if (!initData?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const payoutId = Number(searchParams.get('payout_id'));
  if (!Number.isFinite(payoutId) || payoutId <= 0) {
    return NextResponse.json({ error: 'Valid payout_id required' }, { status: 400 });
  }

  const creatorId = String(initData.user.id);
  const details = await getCreatorPayoutDetails(creatorId, payoutId);
  if (!details?.payout) {
    return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
  }

  const csv = toCsv(payoutStatementRows(details));
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="payout-statement-${payoutId}.csv"`,
    },
  });
}
