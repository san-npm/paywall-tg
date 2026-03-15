import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Creator Terms',
  description: 'Gategram creator terms covering revenue split, monthly payouts, and invoice requirements.',
  path: '/docs/creator-terms',
  keywords: ['creator terms', 'telegram creator payout terms', 'gategram legal'],
});

export default function CreatorTermsPage() {
  return (
    <main className="py-16 px-4">
      <article className="max-w-3xl mx-auto site-panel space-y-6">
        <h1 className="text-3xl font-bold">Gategram Creator Terms (v1)</h1>
        <p className="text-site-muted text-sm">Operator: COMMIT MEDIA S.A R.L. · VAT LU34811132 · RCS B276192</p>

        <section>
          <h2 className="text-xl font-semibold mb-2">Commercial Terms</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-site-muted">
            <li>Revenue split per sale: Creator 95% / Platform fee 5%.</li>
            <li>Payout cadence: monthly.</li>
            <li>Refunds/reversals are deducted from creator payable amounts.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Payout & Invoice Rule</h2>
          <p className="text-sm text-site-muted">
            Creators are paid as suppliers. For each payout cycle, Gategram issues a payout statement, then creator submits an
            invoice to COMMIT MEDIA S.A R.L. for the net payable amount (unless self-billing is activated by separate agreement).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Tax & Content Responsibility</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-site-muted">
            <li>Creators remain responsible for their own tax declarations.</li>
            <li>Creators must own rights for sold content and comply with laws/policies.</li>
          </ul>
        </section>

        <p className="text-xs text-site-muted">This summary is for operational onboarding. Full legal terms should be reviewed by counsel before final publication.</p>
      </article>
    </main>
  );
}
