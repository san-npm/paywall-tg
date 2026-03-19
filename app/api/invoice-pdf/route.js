import { NextResponse } from 'next/server';
import { getCreatorPayoutDetails, getCreatorProfile, getPayoutDetails } from '@/lib/db';
import { validateInitData } from '@/lib/validate';
import { generateInvoicePdf, generateInvoiceNumber } from '@/lib/invoice-pdf';
import { ADMIN_TELEGRAM_IDS } from '@/lib/config';

export const runtime = 'nodejs';

/**
 * GET /api/invoice-pdf?payout_id=123
 * Download a payout invoice PDF.
 * Accessible by the creator (for their own payouts) or admin (for any payout).
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const initDataRaw = req.headers.get('x-telegram-init-data') || searchParams.get('init_data');
  const initData = validateInitData(initDataRaw);
  if (!initData?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = String(initData.user.id);
  const payoutId = Number(searchParams.get('payout_id'));

  if (!Number.isFinite(payoutId) || payoutId <= 0) {
    return NextResponse.json({ error: 'Valid payout_id required' }, { status: 400 });
  }

  // Admin can access any payout, creator only their own
  const isAdmin = ADMIN_TELEGRAM_IDS.has(userId);
  let details;
  if (isAdmin) {
    details = await getPayoutDetails(payoutId);
  } else {
    details = await getCreatorPayoutDetails(userId, payoutId);
  }

  if (!details?.payout) {
    return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
  }

  const profile = await getCreatorProfile(details.payout.creator_id);
  const invoiceNumber = generateInvoiceNumber(payoutId);

  const pdfBuffer = await generateInvoicePdf({
    payout: details.payout,
    profile,
    purchases: details.purchases,
    invoiceNumber,
  });

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoiceNumber}.pdf"`,
      'Cache-Control': 'private, no-cache',
    },
  });
}
