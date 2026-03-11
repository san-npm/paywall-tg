import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Community Monetization on Telegram',
  description: 'Community monetization for Telegram creators: sell access, premium content, and digital products with native payment flow.',
  path: '/community-monetization',
  keywords: ['community monetization', 'telegram community monetization', 'ctelegram monetization'],
});

export default function CommunityMonetizationPage() {
  return (
    <>
      <PageHeader
        badge="SEO Landing"
        title="Community monetization made native"
        description="Monetize Telegram communities with less checkout friction and faster delivery."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4 text-sm text-site-muted">
          <article className="site-panel">
            <h2 className="font-bold text-site-text mb-2">What to monetize</h2>
            <p>Paid groups, premium channel posts, one-time drops, and member-only resources.</p>
          </article>
          <article className="site-panel">
            <h2 className="font-bold text-site-text mb-2">What to optimize</h2>
            <p>Checkout completion, delivery speed, retention, and repeat purchase behavior.</p>
          </article>
        </div>
      </section>

      <PageCTA
        title="Start community monetization"
        description="Use Telegram-native checkout instead of external redirects."
        secondary="See pricing"
        secondaryHref="/fees"
      />
    </>
  );
}
