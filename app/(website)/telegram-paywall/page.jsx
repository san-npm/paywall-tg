import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Telegram Paywall for Paid Communities',
  description: 'Build a Telegram paywall for paid community access, premium posts, and digital product monetization with Stars checkout.',
  path: '/telegram-paywall',
  keywords: ['paywall telegram', 'telegram paywall', 'paid telegram community'],
});

export default function TelegramPaywallPage() {
  return (
    <>
      <PageHeader
        badge="SEO Landing"
        title="Telegram paywall that creators and buyers both understand"
        description="Creators publish paid access. Buyers pay with Stars and unlock instantly, without leaving Telegram."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto space-y-4 text-sm text-site-muted">
          <p>
            A <strong className="text-site-text">Telegram paywall</strong> should do three things well: keep checkout in-app,
            deliver content instantly, and make pricing clear. Gategram is built for that exact flow.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Native Telegram Stars checkout</li>
            <li>Community access and paid content support</li>
            <li>Fast setup for creators, channels, and groups</li>
          </ul>
        </div>
      </section>

      <PageCTA
        title="Launch your Telegram paywall"
        description="Create your first paid offer in minutes with a buyer flow that is clear from first click to unlock."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See docs"
        secondaryHref="/docs"
      />
    </>
  );
}
