import PageHeader from '@/components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description: 'Gategram privacy policy. How we collect, use, and protect your data.',
  path: '/legal/privacy',
});

export default function PrivacyPolicy() {
  return (
    <>
      <PageHeader
        badge="Legal"
        title="Privacy Policy"
        description="Last updated: March 20, 2026"
      />

      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8 text-sm text-site-muted leading-relaxed">

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">1. Who we are</h2>
            <p>Gategram is a brand of <strong className="text-site-text">COMMIT MEDIA SARL</strong>, a company registered in Luxembourg (registration number LU34811132), with its registered office at 147 route de Thionville, L-2611 Luxembourg.</p>
            <p>Contact: <a href="mailto:bob@openletz.com" className="text-site-accent underline">bob@openletz.com</a></p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">2. Data we collect</h2>
            <p>We collect the minimum data necessary to operate the service:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-site-text">Telegram user data:</strong> Your Telegram user ID, username, and first name, provided by the Telegram Mini App SDK when you open Gategram. We do not access your phone number, contacts, or message history.</li>
              <li><strong className="text-site-text">Creator profile data:</strong> Legal name, email address, country, and payout details (IBAN or PayPal email), provided voluntarily when you set up payouts.</li>
              <li><strong className="text-site-text">Transaction data:</strong> Purchase records including product ID, buyer ID, amount paid, payment method, and timestamp.</li>
              <li><strong className="text-site-text">Usage data:</strong> Page views and interaction events via Google Analytics (anonymized, no personal identifiers).</li>
            </ul>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To authenticate you via Telegram and provide access to the service.</li>
              <li>To process purchases and deliver paid content to buyers.</li>
              <li>To calculate and process creator payouts.</li>
              <li>To generate invoices for payout accounting.</li>
              <li>To prevent fraud, abuse, and duplicate transactions.</li>
              <li>To improve the service through anonymized analytics.</li>
            </ul>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">4. Data storage and security</h2>
            <p>Your data is stored in a Turso (libSQL) database hosted in the EU (AWS eu-west-1, Ireland). All data is encrypted in transit (TLS) and at rest. We do not store payment card details — payments are handled by Telegram (Stars) and Stripe.</p>
            <p>Authentication uses Telegram's HMAC-SHA256 initData validation with timing-safe comparison and replay protection.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">5. Data sharing</h2>
            <p>We do not sell your data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-site-text">Telegram:</strong> For payment processing via Stars.</li>
              <li><strong className="text-site-text">Stripe:</strong> For card payment processing (when enabled).</li>
              <li><strong className="text-site-text">Google Analytics:</strong> Anonymized usage data only.</li>
            </ul>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">6. Your rights</h2>
            <p>Under GDPR, you have the right to access, rectify, delete, or export your personal data. You can also object to processing or request restriction.</p>
            <p>To exercise these rights, contact us at <a href="mailto:bob@openletz.com" className="text-site-accent underline">bob@openletz.com</a>. We will respond within 30 days.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">7. Data retention</h2>
            <p>Transaction records are retained for the duration required by Luxembourg tax law (10 years). Creator profiles are retained while the account is active and deleted upon request. Processed webhook update IDs are retained for 3 days and then automatically purged.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">8. Cookies</h2>
            <p>Gategram does not use cookies for tracking. We use <code className="px-1 py-0.5 rounded bg-site-elevated text-site-text text-xs">sessionStorage</code> to cache your Telegram authentication token for the duration of your session. Google Analytics may set its own cookies according to its own policy.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">9. Changes to this policy</h2>
            <p>We may update this policy from time to time. Changes will be posted on this page with an updated date. Continued use of the service constitutes acceptance of the revised policy.</p>
          </div>

        </div>
      </section>
    </>
  );
}
