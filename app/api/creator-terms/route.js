import { NextResponse } from 'next/server';
import { CREATOR_TERMS_URL, CREATOR_TERMS_VERSION } from '@/lib/config';
import { acceptCreatorTerms, getCreatorTermsAcceptance, getOrCreateCreator } from '@/lib/db';
import { getForwardedClientIp, validateInitDataDetailed } from '@/lib/validate';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const initDataRaw = req.headers.get('x-telegram-init-data') || '';
  const initDataChecked = validateInitDataDetailed(initDataRaw);

  if (!initDataChecked.ok || !initDataChecked.data?.user?.id) {
    return NextResponse.json({
      error: 'Invalid or expired Telegram authentication',
      code: initDataChecked.error || 'INVALID_INITDATA',
    }, { status: 401 });
  }
  const initData = initDataChecked.data;

  const creatorId = String(initData.user.id);
  await getOrCreateCreator(creatorId, initData.user.username || null, initData.user.first_name || null);
  const acceptance = await getCreatorTermsAcceptance(creatorId);

  return NextResponse.json({
    required_version: CREATOR_TERMS_VERSION,
    terms_url: CREATOR_TERMS_URL,
    accepted: Boolean(acceptance && acceptance.terms_version === CREATOR_TERMS_VERSION),
    accepted_version: acceptance?.terms_version || null,
    accepted_at: acceptance?.accepted_at || null,
  });
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const initDataRaw = body?.init_data || req.headers.get('x-telegram-init-data');
  const initDataChecked = validateInitDataDetailed(initDataRaw);
  if (!initDataChecked.ok || !initDataChecked.data?.user?.id) {
    return NextResponse.json({
      error: 'Invalid or expired Telegram authentication',
      code: initDataChecked.error || 'INVALID_INITDATA',
    }, { status: 401 });
  }
  const initData = initDataChecked.data;

  const creatorId = String(initData.user.id);

  const { limited } = await checkRateLimit(`terms:${creatorId}`, 10);
  if (limited) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  await getOrCreateCreator(creatorId, initData.user.username || null, initData.user.first_name || null);

  const acceptance = await acceptCreatorTerms(
    creatorId,
    getForwardedClientIp(req.headers.get('x-forwarded-for')),
    req.headers.get('user-agent') || null,
  );

  return NextResponse.json({
    ok: true,
    required_version: CREATOR_TERMS_VERSION,
    terms_url: CREATOR_TERMS_URL,
    accepted: Boolean(acceptance && acceptance.terms_version === CREATOR_TERMS_VERSION),
    accepted_version: acceptance?.terms_version || null,
    accepted_at: acceptance?.accepted_at || null,
  });
}
