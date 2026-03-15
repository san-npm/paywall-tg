import { NextResponse } from 'next/server';
import { getCreatorFinancialSummary, getOrCreateCreator } from '@/lib/db';
import { validateInitData } from '@/lib/validate';

export const runtime = 'nodejs';

export async function GET(req) {
  const initDataRaw = req.headers.get('x-telegram-init-data');
  const initData = validateInitData(initDataRaw);
  if (!initData?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const creatorId = String(initData.user.id);
  await getOrCreateCreator(creatorId, initData.user.username || null, initData.user.first_name || null);
  const summary = await getCreatorFinancialSummary(creatorId);

  return NextResponse.json(summary);
}
