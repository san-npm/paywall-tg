import { NextResponse } from 'next/server';
import { getBuyerPurchases } from '@/lib/db';
import { validateInitData } from '@/lib/validate';

export const runtime = 'nodejs';

export async function GET(req) {
  const initDataRaw = req.headers.get('x-telegram-init-data') || new URL(req.url).searchParams.get('init_data');
  const initData = validateInitData(initDataRaw);
  if (!initData?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const buyerId = String(initData.user.id);
  const purchases = await getBuyerPurchases(buyerId);

  return NextResponse.json({ purchases });
}
