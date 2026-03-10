import PageHeader, { PageCTA } from '../../../components/website/PageHeader';

export const metadata = {
  title: 'Security & Webhook Validation — PayGate',
  description: 'How PayGate validates Telegram webhooks, secures transactions, and protects creator and buyer data.',
};

export default function SecurityPage() {
  return (
    <>
      <PageHeader
        badge="Trust"
        title="Security & webhook validation"
        description="PayGate takes a security-first approach. Every webhook is validated, every transaction is verified, and we never touch payment credentials."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Webhook validation</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-card">
              <h3 className="font-bold mb-2">HMAC-SHA256 signature verification</h3>
              <p className="text-sm text-site-muted leading-relaxed">
                Every incoming webhook from Telegram is validated using HMAC-SHA256 with the bot token as the secret key.
                This cryptographically proves that the webhook originated from Telegram and was not tampered with in transit.
                Invalid signatures are rejected immediately.
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
                Before confirming any pre_checkout_query, PayGate verifies the payment amount matches the product&rsquo;s price in the database.
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
                desc: 'PayGate stores only what\'s needed: Telegram user IDs, product metadata, and transaction records. We don\'t collect emails, phone numbers, or personal data beyond what Telegram provides.',
              },
              {
                title: 'No payment credentials',
                desc: 'All payment processing happens through Telegram\'s Stars system. PayGate never sees, stores, or processes credit card numbers, bank details, or payment credentials.',
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
              { title: 'HTTPS everywhere', desc: 'All communication between Telegram, PayGate, and users is encrypted with TLS.' },
              { title: 'Input validation', desc: 'All user inputs are validated and sanitized before processing to prevent injection attacks.' },
              { title: 'UUID product IDs', desc: 'Product IDs are cryptographically random UUIDs, not sequential integers. This prevents enumeration attacks.' },
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

      <PageCTA
        title="Questions about security?"
        description="Reach out via the bot or check the docs for technical details."
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
