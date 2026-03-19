import { NextResponse } from 'next/server';
import { getCreatorPayoutDetails } from '@/lib/db';
import { validateInitData } from '@/lib/validate';
import { payoutStatementRows, toCsv } from '@/lib/payout-statement';

export const runtime = 'nodejs';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const initDataRaw = req.headers.get('x-telegram-init-data') || searchParams.get('init_data') || '';
  const initData = validateInitData(initDataRaw);
  if (!initData?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
