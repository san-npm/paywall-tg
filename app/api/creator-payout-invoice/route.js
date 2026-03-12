import { NextResponse } from 'next/server';
import { submitCreatorPayoutInvoice } from '@/lib/db';
import { validateInitData } from '@/lib/validate';

export const runtime = 'nodejs';

export async function POST(req) {
  const initDataRaw = req.headers.get('x-telegram-init-data');
  const initData = validateInitData(initDataRaw);
  if (!initData?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

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

  const ok = await submitCreatorPayoutInvoice(String(initData.user.id), payoutId, invoiceRef, invoiceUrl || null, invoiceNotes || null);
  if (!ok) {
    return NextResponse.json({ error: 'Payout not found, not yours, or not pending' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
