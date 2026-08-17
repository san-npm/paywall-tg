import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata, jsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Telegram Paywall Security & Webhook Validation',
  description: 'Security architecture for Telegram monetization: webhook verification, auth validation, and transaction safeguards.',
  path: '/security',
  keywords: ['telegram webhook security', 'telegram payment security'],
});

export default function SecurityPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Security', item: 'https://gategram.app/security' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <PageHeader
        badge="Trust"
        title="Security & webhook validation"
        description="Gategram validates webhook secrets, authenticates Mini App requests, verifies payment amounts, and does not collect buyer card details."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Webhook validation</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-card">
              <h3 className="font-bold mb-2">Telegram webhook secret verification</h3>
              <p className="text-sm text-site-muted leading-relaxed">
                Telegram sends a deployment-specific secret token in the webhook request header. Gategram compares it with a timing-safe check and rejects missing or incorrect values before processing an update.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-card">
              <h3 className="font-bold mb-2">initData validation</h3>
              <p className="text-sm text-site-muted leading-relaxed">
                When creators interact through the Mini App, we validate Telegram&rsquo;s initData payload.
                This confirms the user&rsquo;s identity comes directly from Telegram&rsquo;s authentication system, preventing impersonation.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-card">
              <h3 className="font-bold mb-2">Payment amount verification</h3>
              <p className="text-sm text-site-muted leading-relaxed">
                Before confirming any pre_checkout_query, Gategram verifies the payment amount matches the product&rsquo;s price in the database.
                This prevents manipulation of the payment amount between the invoice creation and checkout confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Data handling</h2>
          <div className="space-y-4">
            {[
              {
                title: 'Minimal data collection',
                desc: 'Gategram stores Telegram identity fields, product and transaction records, and creator payout details when a creator supplies them. It does not request buyer phone numbers, contacts, or message history.',
              },
              {
                title: 'No payment credentials',
                desc: 'New purchases use Telegram Stars. Gategram does not collect buyer card numbers or payment credentials. Creator payout details are stored separately for payout administration.',
              },
              {
                title: 'Content isolation',
                desc: 'Product content (the text, links, or files creators upload) is stored separately from transaction data and delivered only to verified buyers.',
              },
              {
                title: 'Rate limiting',
                desc: 'API endpoints are rate-limited to prevent abuse, brute force attempts, and denial of service. Excessive requests are blocked automatically.',
              },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl border border-site-border bg-site-bg">
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Infrastructure</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'HTTPS everywhere', desc: 'All communication between Telegram, Gategram, and users is encrypted with TLS.' },
              { title: 'Input validation', desc: 'All user inputs are validated and sanitized before processing to prevent injection attacks.' },
              { title: 'Random product IDs', desc: 'New product IDs are eight-character, non-sequential identifiers generated with cryptographic randomness. Paid content still requires verified ownership or purchase; an ID is not treated as authorization.' },
              { title: 'Dependency auditing', desc: 'Dependencies are regularly audited for known vulnerabilities using automated security scanning.' },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl border border-site-border bg-site-card">
                <h3 className="font-bold mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Operational security runbook</h2>
          <div className="space-y-4">
            {[
              { title: 'Quarterly secret rotation', desc: 'Rotate BOT_TOKEN, WEBHOOK_SECRET, and database auth tokens on a regular cadence or immediately after any suspected exposure.' },
              { title: 'Post-rotation validation', desc: 'After every rotation, validate Mini App auth, webhook delivery, invoice creation, and successful content delivery before closing the incident/change.' },
              { title: 'Incident rollback plan', desc: 'Keep a short rollback window with prior secret versions available in secure storage to reduce time-to-recovery if verification checks fail.' },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl border border-site-border bg-site-bg">
                <h3 className="font-bold mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCTA
        title="Questions about security?"
        description="Reach out via the bot or check the docs for technical details."
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
