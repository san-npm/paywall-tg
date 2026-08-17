import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Creator Terms',
  description: 'Gategram creator terms covering service fees, payout rates, holding periods, refunds, and invoice requirements.',
  path: '/docs/creator-terms',
  keywords: ['creator terms', 'telegram creator payout terms', 'gategram legal'],
});

export default function CreatorTermsPage() {
  return (
    <main className="py-16 px-4">
      <article className="max-w-3xl mx-auto site-panel space-y-6">
        <h1 className="text-3xl font-bold">Gategram Creator Terms (v2)</h1>
        <p className="text-site-muted text-sm">Operator: COMMIT MEDIA S.A R.L. · VAT LU34811132 · RCS B276192</p>
        <p className="text-site-muted text-sm">Effective and last updated: August 17, 2026</p>

        <section>
          <h2 className="text-xl font-semibold mb-2">Commercial Terms</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-site-muted">
            <li>Gategram records a creator share in Stars after a service fee of up to 5%. Whole-Star fees are rounded down and never exceed 5%.</li>
            <li>Telegram Stars are received by the Gategram bot account; creators do not receive Stars directly.</li>
            <li>The creator share is converted to EUR using Gategram&rsquo;s published payout rate, based on Telegram&rsquo;s bot-developer reward after foreign-exchange, liquidity, network, and operating reserves.</li>
            <li>Refunds/reversals are deducted from creator payable amounts.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Payout & Invoice Rule</h2>
          <p className="text-sm text-site-muted">
            Earnings remain on hold for at least 21 days after purchase. A payout may be requested after at least 1,000 cleared
            Stars. The EUR rate is locked when Gategram creates the payout record. Gategram then issues a payout statement and the
            creator submits an invoice to COMMIT MEDIA S.A R.L. for the payable amount, unless self-billing is separately agreed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Refunds, support, and reserves</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-site-muted">
            <li>Gategram may delay or reverse amounts affected by refunds, fraud, sanctions, platform holds, or disputes.</li>
            <li>Creators must accurately describe and deliver their products. Buyers can request payment support through <code>/paysupport</code> or bob@openletz.com.</li>
            <li>Payout rates and thresholds may change for future payouts when Telegram&rsquo;s reward or withdrawal conditions change.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Tax & Content Responsibility</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-site-muted">
            <li>Creators remain responsible for their own tax declarations.</li>
            <li>Creators must own rights for sold content and comply with laws/policies.</li>
          </ul>
        </section>

        <p className="text-xs text-site-muted">These terms form part of Gategram&rsquo;s Terms of Service. Mandatory rights under applicable law remain unaffected.</p>
      </article>
    </main>
  );
}
