import PageHeader from '@/components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Terms of Service',
  description: 'Gategram terms of service. Rules and conditions for using the platform.',
  path: '/legal/terms',
});

export default function TermsOfService() {
  return (
    <>
      <PageHeader
        badge="Legal"
        title="Terms of Service"
        description="Last updated: August 17, 2026"
      />

      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8 text-sm text-site-muted leading-relaxed">

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">1. Service overview</h2>
            <p>Gategram is a platform operated by <strong className="text-site-text">COMMIT MEDIA SARL</strong> (Luxembourg, VAT LU34811132, RCS B276192) that enables creators to sell digital content through Telegram using Telegram Stars.</p>
            <p>By using Gategram, you agree to these terms. Buyers confirm agreement before a new invoice is issued, and we retain a versioned acceptance record. If you do not agree, do not use the service.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">2. Eligibility</h2>
            <p>You must have a valid Telegram account to use Gategram. Creators who wish to receive payouts must provide accurate profile information (legal name, email, country, payout details).</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">3. Creator obligations</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You are solely responsible for the content you sell. It must not violate applicable laws or Telegram's terms of service.</li>
              <li>You must accurately describe what buyers will receive.</li>
              <li>You must not use the platform to sell illegal goods, services, or content.</li>
              <li>You are responsible for any tax obligations arising from your sales.</li>
            </ul>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">4. Buyer obligations</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Digital content is normally delivered after Telegram confirms payment; temporary Telegram or delivery failures may be retried.</li>
              <li>Refunds are handled under applicable law, Telegram&rsquo;s payment rules, and the circumstances of the transaction.</li>
              <li>You must not redistribute, resell, or publicly share purchased content unless the creator explicitly permits it.</li>
            </ul>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">5. Fees and payouts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gategram charges a service fee of up to <strong className="text-site-text">5%</strong> on each sale. Whole-Star fees are rounded down.</li>
              <li>Telegram credits Stars to Gategram&rsquo;s bot account. Gategram records the remaining creator share internally; creators do not receive those Stars directly.</li>
              <li>Creator shares become eligible after a minimum 21-day hold and are converted to EUR using the published payout rate. That rate reflects Telegram&rsquo;s bot-developer reward rather than the consumer purchase price of Stars.</li>
              <li>The minimum payout threshold is 1,000 cleared Stars. The applicable EUR rate is locked when the payout record is created.</li>
              <li>SEPA or PayPal transfer charges shown before payout are deducted from the payable amount. Payouts may be held for refunds, fraud, sanctions, tax, or compliance checks.</li>
            </ul>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">6. Payments</h2>
            <p>Digital-goods payments in the Telegram bot and Mini App are processed exclusively through Telegram Stars, subject to Telegram&rsquo;s terms. Gategram does not ask buyers for payment-card details.</p>
            <p>For payment or delivery problems, use <strong className="text-site-text">/paysupport</strong> or <strong className="text-site-text">/support</strong> in the bot, or email <a href="mailto:bob@openletz.com" className="text-site-accent underline">bob@openletz.com</a>. Gategram, not Telegram, is responsible for resolving purchases made through Gategram.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">7. Content moderation</h2>
            <p>We reserve the right to disable any product or creator account that violates these terms, applicable law, or Telegram's terms of service. We may do so without prior notice in cases of clear violations.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">8. Intellectual property</h2>
            <p>Creators retain full ownership of the content they sell. By using Gategram, creators grant us a limited license to host, display descriptions of, and deliver their content to paying buyers.</p>
            <p>The Gategram name, logo, and platform code are the property of COMMIT MEDIA SARL.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">9. Limitation of liability</h2>
            <p>Gategram is provided "as is" without warranties of any kind. We are not liable for indirect, incidental, or consequential damages. Our total liability is limited to the fees you have paid to us in the 12 months preceding the claim.</p>
            <p>We are not responsible for content sold by creators, failures of Telegram or other infrastructure providers, or losses arising from unauthorized access to your Telegram account, except where applicable law provides otherwise.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">10. Termination</h2>
            <p>You may stop using Gategram at any time. Creators can request deletion of their profile and data by contacting us. We may suspend or terminate accounts that violate these terms.</p>
            <p>Upon termination, eligible cleared amounts will be processed after applicable holds and reviews, provided the creator&rsquo;s profile is complete and no legal or policy restriction applies.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">11. Governing law</h2>
            <p>These terms are governed by the laws of the Grand Duchy of Luxembourg. Any disputes shall be submitted to the exclusive jurisdiction of the courts of Luxembourg City.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">12. Changes to these terms</h2>
            <p>We may update these terms from time to time. Changes will be posted on this page with an updated date. Continued use of the service after changes constitutes acceptance.</p>
          </div>

          <div className="site-panel space-y-3">
            <h2 className="text-lg font-bold text-site-text">13. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:bob@openletz.com" className="text-site-accent underline">bob@openletz.com</a>.</p>
          </div>

        </div>
      </section>
    </>
  );
}
