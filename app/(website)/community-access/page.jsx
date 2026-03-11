import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Paid Community Access in Telegram',
  description: 'Sell community access in Telegram with native Stars checkout. Gate premium groups, channels, and exclusive content.',
  path: '/community-access',
  keywords: ['community access', 'paid community access telegram', 'telegram paid group access'],
});

export default function CommunityAccessPage() {
  return (
    <>
      <PageHeader
        badge="SEO Landing"
        title="Sell paid community access"
        description="Turn your Telegram audience into recurring revenue with clear access offers."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto space-y-4 text-sm text-site-muted">
          <p>
            If you run a private Telegram group or channel, a paid access model is often the cleanest monetization path.
            Keep the payment flow inside Telegram, then deliver access instantly.
          </p>
          <p>
            Use this approach for coaching groups, alpha channels, trading research, creator communities, and niche education hubs.
          </p>
        </div>
      </section>

      <PageCTA
        title="Monetize access now"
        description="Create a paid access offer and publish your buy link."
        secondary="How payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
