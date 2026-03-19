import { NextResponse } from 'next/server';
import { submitCreatorPayoutInvoice, createPayoutsFromUnassigned, getCreatorProfile, getCreatorFinancialSummary } from '@/lib/db';
import { validateInitData } from '@/lib/validate';
import { checkRateLimit } from '@/lib/rateLimit';
import { MIN_PAYOUT_STARS } from '@/lib/constants';

export const runtime = 'nodejs';

export async function POST(req) {
  const initDataRaw = req.headers.get('x-telegram-init-data');
  const initData = validateInitData(initDataRaw);
  if (!initData?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const creatorId = String(initData.user.id);

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  // Creator-initiated payout request
  if (body?.request_payout) {
    const { limited } = await checkRateLimit(`payout_request:${creatorId}`, 5);
    if (limited) return NextResponse.json({ error: 'Too many payout requests. Please wait.' }, { status: 429 });

    // Verify profile is complete
    const profile = await getCreatorProfile(creatorId);
    if (!profile?.legal_name || !profile?.email || !profile?.country || !profile?.payout_details) {
      return NextResponse.json({ error: 'Complete your profile before requesting a payout (legal name, email, country, payout details).' }, { status: 400 });
    }

    // Verify minimum balance
    const summary = await getCreatorFinancialSummary(creatorId);
    const pendingStars = Number(summary.totals?.pending_stars || 0);
    if (pendingStars < MIN_PAYOUT_STARS) {
      return NextResponse.json({ error: `Minimum ${MIN_PAYOUT_STARS} Stars required for payout. You have ${pendingStars}.` }, { status: 400 });
    }

    // Create payout from unassigned purchases
    const created = await createPayoutsFromUnassigned(creatorId);
    if (!created.length) {
      return NextResponse.json({ error: 'No unassigned earnings found for payout.' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, payouts: created });
  }

  // Existing flow: submit invoice for a specific payout
  const payoutId = Number(body?.payout_id);
  const invoiceRef = String(body?.invoice_ref || '').trim();
  const invoiceUrl = String(body?.invoice_url || '').trim();
  const invoiceNotes = String(body?.invoice_notes || '').trim();

  if (!Number.isFinite(payoutId) || payoutId <= 0) {
    return NextResponse.json({ error: 'Valid payout_id required' }, { status: 400 });
  }
  if (!invoiceRef) {
    return NextResponse.json({ error: 'invoice_ref is required' }, { status: 400 });
  }

  const ok = await submitCreatorPayoutInvoice(creatorId, payoutId, invoiceRef, invoiceUrl || null, invoiceNotes || null);
  if (!ok) {
    return NextResponse.json({ error: 'Payout not found, not yours, or not pending' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
