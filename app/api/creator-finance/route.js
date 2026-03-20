import { NextResponse } from 'next/server';
import { getCreatorFinancialSummary, getOrCreateCreator, getCreatorProfile } from '@/lib/db';
import { validateInitData } from '@/lib/validate';
import { DEFAULT_EUR_PER_STAR } from '@/lib/config';
import { MIN_PAYOUT_STARS, PAYOUT_FEES } from '@/lib/constants';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function GET(req) {
  const initDataRaw = req.headers.get('x-telegram-init-data');
  const initData = validateInitData(initDataRaw);
  if (!initData?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const creatorId = String(initData.user.id);
  const { limited } = await checkRateLimit(`finance:${creatorId}`, 30);
  if (limited) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  await getOrCreateCreator(creatorId, initData.user.username || null, initData.user.first_name || null);
  const summary = await getCreatorFinancialSummary(creatorId);
  const profile = await getCreatorProfile(creatorId);

  // Add EUR conversion and payout eligibility
  const eurPerStar = DEFAULT_EUR_PER_STAR;
  const pendingStars = Number(summary.totals?.pending_stars || 0);
  const payoutMethod = profile?.payout_method || 'bank_transfer';
  const grossEur = Number((pendingStars * eurPerStar).toFixed(2));
  const fee = PAYOUT_FEES[payoutMethod] || PAYOUT_FEES.bank_transfer;
  const feeEur = grossEur > 0 ? Number((grossEur * (fee.percent / 100) + fee.fixed_eur).toFixed(2)) : 0;
  const netEur = Number((grossEur - feeEur).toFixed(2));

  return NextResponse.json({
    ...summary,
    eur_per_star: eurPerStar,
    payout_info: {
      eligible: pendingStars >= MIN_PAYOUT_STARS,
      min_payout_stars: MIN_PAYOUT_STARS,
      payout_method: payoutMethod,
      gross_eur: grossEur,
      fee_eur: feeEur,
      net_eur: netEur,
      fee_description: fee.description,
      profile_complete: Boolean(profile?.legal_name && profile?.email && profile?.country && profile?.payout_details),
    },
  });
}
