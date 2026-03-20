import { NextResponse } from 'next/server';
import { getBuyerPurchases } from '@/lib/db';
import { validateInitData } from '@/lib/validate';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function GET(req) {
  const initDataRaw = req.headers.get('x-telegram-init-data') || new URL(req.url).searchParams.get('init_data');
  const initData = validateInitData(initDataRaw);
  if (!initData?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const buyerId = String(initData.user.id);
  const { limited } = await checkRateLimit(`purchases:${buyerId}`, 60);
  if (limited) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const purchases = await getBuyerPurchases(buyerId);
  return NextResponse.json({ purchases });
}
