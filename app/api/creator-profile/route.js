import { NextResponse } from 'next/server';
import { getCreatorProfile, getOrCreateCreator, upsertCreatorProfile } from '@/lib/db';
import { sanitizeCreatorProfileInput, validateInitData } from '@/lib/validate';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

function auth(req) {
  const initDataRaw = req.headers.get('x-telegram-init-data');
  const initData = validateInitData(initDataRaw);
  if (!initData?.user?.id) return null;
  return {
    creatorId: String(initData.user.id),
    username: initData.user.username || null,
    displayName: initData.user.first_name || null,
  };
}

export async function GET(req) {
  const identity = auth(req);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await getOrCreateCreator(identity.creatorId, identity.username, identity.displayName);
  const profile = await getCreatorProfile(identity.creatorId);
  return NextResponse.json({ profile });
}

export async function POST(req) {
  const identity = auth(req);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { limited } = await checkRateLimit(`profile:${identity.creatorId}`, 20);
  if (limited) return NextResponse.json({ error: 'Too many profile updates' }, { status: 429 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  const validated = sanitizeCreatorProfileInput(body || {});
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  await getOrCreateCreator(identity.creatorId, identity.username, identity.displayName);
  const profile = await upsertCreatorProfile(identity.creatorId, validated.value);
  return NextResponse.json({ ok: true, profile });
}
