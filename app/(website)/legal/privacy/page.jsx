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
        description="Last updated: August 17, 2026"
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
              <li><strong className="text-site-text">Consent records:</strong> The terms version, time, source, IP address, and user agent recorded when a buyer or creator accepts the applicable terms.</li>
              <li><strong className="text-site-text">Usage data:</strong> Public-site page views and interaction events via Google Analytics only after you opt in.</li>
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
            <p>Your data is stored in a Turso (libSQL) database hosted in the EU (AWS eu-west-1, Ireland). All data is encrypted in transit (TLS) and at rest. New digital-goods payments are handled by Telegram Stars. We retain limited historical Stripe transaction identifiers for refunds, dispute handling, and accounting, but do not store card details.</p>
            <p>Authentication uses Telegram's HMAC-SHA256 initData validation with timing-safe comparison and replay protection.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">5. Data sharing</h2>
            <p>We do not sell your data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-site-text">Telegram:</strong> For payment processing via Stars.</li>
              <li><strong className="text-site-text">Stripe:</strong> Only for historical refund, dispute, and accounting records from the retired card flow.</li>
              <li><strong className="text-site-text">Google Analytics:</strong> Public-site usage data only after explicit consent.</li>
            </ul>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">6. Your rights</h2>
            <p>Under GDPR, you have the right to access, rectify, delete, or export your personal data. You can also object to processing or request restriction.</p>
            <p>To exercise these rights, contact us at <a href="mailto:bob@openletz.com" className="text-site-accent underline">bob@openletz.com</a>. We will respond within 30 days.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">7. Data retention</h2>
            <p>Transaction and associated terms-acceptance records are retained for the duration required to establish transactions and meet Luxembourg accounting or legal obligations (normally 10 years for accounting records). Creator profiles are retained while the account is active and deleted upon request where no legal retention duty applies. Processed webhook update IDs are retained for 3 days and then automatically purged.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">8. Cookies</h2>
            <p>We use <code className="px-1 py-0.5 rounded bg-site-elevated text-site-text text-xs">sessionStorage</code> to cache Telegram authentication for the session and <code className="px-1 py-0.5 rounded bg-site-elevated text-site-text text-xs">localStorage</code> to remember your analytics choice. Google Analytics is not loaded unless you accept; if accepted, Google may set analytics cookies under its policy. Global Privacy Control or Do Not Track is treated as a decline when no choice has been saved.</p>
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
