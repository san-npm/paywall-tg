import Link from 'next/link';
import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata, jsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Telegram Paywall for Paid Communities & Content',
  description: 'Set up a Telegram paywall with native Stars checkout. Sell paid content and one-time community access without an external checkout page.',
  path: '/telegram-paywall',
  keywords: ['paywall telegram', 'telegram paywall', 'telegram new paywall', 'telegram new pay wall', 'telegram paywall bot', 'paid telegram community', 'telegram paywall setup', 'telegram paywall 2026'],
});

export default function TelegramPaywallPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Telegram Paywall', item: 'https://gategram.app/telegram-paywall' },
    ],
  };

  // Single source of truth: the visible step-by-step block and the HowTo
  // structured data are both built from this array so they match verbatim.
  const howToSteps = [
    {
      name: 'Connect the Gategram bot',
      text: 'Open the official Gategram bot in Telegram. There is no coding, bot token, Stripe account, or external dashboard to configure.',
    },
    {
      name: 'Create a paid offer',
      text: 'Set a title, choose your price in Telegram Stars (20 to 10,000 Stars), and add the content you want to gate — text, links, files, or a private group invite.',
    },
    {
      name: 'Share the buy link',
      text: 'Post the buy link in your channel, group, or DMs. Pin it or add it to your channel description so it keeps selling on autopilot.',
    },
    {
      name: 'Buyers pay and unlock automatically',
      text: 'A buyer taps the link, confirms the native Telegram Stars invoice, and receives the content as a message. The platform fee is never more than 5%.',
    },
  ];

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to set up a Telegram paywall',
    description: 'Set up a Telegram paywall with Gategram using native Telegram Stars checkout, without code or Stripe configuration.',
    totalTime: 'PT2M',
    step: howToSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };

  // Single source of truth: the visible FAQ and the FAQPage schema are both
  // built from this array so the structured data matches the DOM verbatim.
  const faqs = [
    {
      q: 'What is a Telegram paywall?',
      a: 'A Telegram paywall restricts access to content or communities until a buyer completes a payment. With native Telegram Stars checkout, the payment happens inside the Telegram app — no external pages, no account creation, no credit card form.',
    },
    {
      q: 'How do I set up a Telegram paywall?',
      a: 'With Gategram, connect the bot, create a paid offer (title, price in Stars, content), and share the buy link in your channel or group. No coding, no Stripe configuration. Setup takes only a few steps.',
    },
    {
      q: 'Does a Telegram paywall work for one-time sales?',
      a: 'Yes. Gategram supports one-time paid content, digital product drops, and access offers. You are not limited to subscription models — any piece of content can be sold individually.',
    },
    {
      q: 'What happens when a buyer pays?',
      a: 'The buyer taps the buy link inside Telegram, confirms a Telegram Stars invoice, and the content or access is queued for automatic delivery as a Telegram message.',
    },
    {
      q: 'How much does a Telegram paywall cost?',
      a: 'Gategram charges at most 5% per sale, rounded down to whole Stars. There is no monthly or setup fee, so creators retain at least 95% in the Gategram balance.',
    },
    {
      q: 'Can I sell files, links, and text behind a paywall?',
      a: 'Yes. You can sell any digital content: text posts, file downloads, links, access credentials, and invite links to private groups — all delivered automatically after payment.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />

      <PageHeader
        badge="Telegram Paywall"
        title="Telegram Paywall: sell paid content & gate access with Stars"
        description="Creators publish paid access. Buyers pay with Telegram Stars and unlock automatically — without leaving Telegram."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">What a Telegram paywall should actually do</h2>
          <p className="text-site-muted text-sm leading-relaxed">
            Most paywall setups for Telegram send your buyer to an external checkout page — Stripe, PayPal, Gumroad, or a custom payment link.
            Depending on the provider, the buyer may leave Telegram, open another page, enter payment details, and then return for delivery.
            Those additional steps can add friction; measure your own funnel to understand their effect on your audience.
          </p>
          <p className="text-site-muted text-sm leading-relaxed">
            A native Telegram paywall removes the external checkout step. The buyer confirms a Stars invoice in Telegram, and Gategram attempts delivery as soon as Telegram confirms payment, with a retry queue for temporary failures.
            No browser. No account creation. No card form.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How Gategram's Telegram paywall works</h2>
          <div className="grid md:grid-cols-3 gap-5">
            <article className="site-step">
              <span className="site-step-n">01</span>
              <h3 className="text-lg font-bold mb-2">Create a paid offer</h3>
              <p className="text-sm text-site-muted">Set a title, choose your Stars price, and add the content you want to sell — text, links, files, or access credentials. No coding required.</p>
            </article>
            <article className="site-step">
              <span className="site-step-n">02</span>
              <h3 className="text-lg font-bold mb-2">Share the buy link</h3>
              <p className="text-sm text-site-muted">Post the link in your Telegram channel, group, or DMs. You can also pin it or include it in your channel description for ongoing sales.</p>
            </article>
            <article className="site-step">
              <span className="site-step-n">03</span>
              <h3 className="text-lg font-bold mb-2">Buyer pays, content unlocks</h3>
              <p className="text-sm text-site-muted">The buyer taps your link, sees the native Telegram Stars payment dialog, confirms the invoice, and receives the content as a message automatically.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How to set up a Telegram paywall (step by step)</h2>
          <ol className="space-y-4">
            {howToSteps.map((step, i) => (
              <li key={step.name} className="site-step flex gap-4">
                <span className="site-step-n shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-lg font-bold mb-1">{step.name}</h3>
                  <p className="text-sm text-site-muted leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-sm text-site-muted mt-6 leading-relaxed">
            Need the full walkthrough? Read our guide on{' '}
            <Link href="/how-to-sell-on-telegram" className="text-site-accent underline">how to sell on Telegram</Link>{' '}
            or see a concrete example of how to{' '}
            <Link href="/use-cases/sell-digital-products-on-telegram" className="text-site-accent underline">sell digital products on Telegram</Link>.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Best Telegram paywall bot — what to look for</h2>
          <p className="text-site-muted text-sm mb-6 leading-relaxed">
            Most Telegram paywall bots simply post a link to an external checkout. When you're comparing a paywall bot for Telegram,
            these are the criteria that actually move conversion and protect your margin:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Native in-app checkout', desc: 'The payment dialog should be native Telegram Stars, so buyers never leave the app for an external browser page.' },
              { title: 'Automatic delivery', desc: 'Content or the group invite should be delivered as a Telegram message the moment payment confirms — no manual steps, no email.' },
              { title: 'No separate buyer account', desc: 'Buyers confirm a Stars invoice from their Telegram account. No Gategram sign-up or card form.' },
              { title: 'Transparent fees', desc: 'Look for a clear fee. Gategram charges at most 5% per sale, rounded down to whole Stars, with no monthly cost.' },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl border border-site-border bg-site-bg">
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">What you can sell behind a Telegram paywall</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Premium channel posts', desc: 'Share a free teaser in your public channel, then sell the full analysis, breakdown, or report behind a pay link.' },
              { title: 'Private group access', desc: 'Gate your private Telegram group or channel. Buyers pay and receive an invite link delivered automatically.' },
              { title: 'Trading signals & alpha', desc: 'Sell individual signal drops, market analyses, or weekly research packages to your trading community.' },
              { title: 'Digital products & files', desc: 'Ebooks, templates, presets, design assets, courses — any file delivered as a Telegram message after payment.' },
              { title: 'Exclusive content drops', desc: 'One-time content like early access tracks, unreleased material, or limited-edition digital items.' },
              { title: 'Consulting & access slots', desc: 'Sell time slots, AMA access, or 1-on-1 consulting links with automatic paid delivery.' },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl border border-site-border bg-site-card">
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">External checkout vs native Telegram paywall</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-2">External checkout flow</h3>
              <ul className="space-y-2 text-sm text-site-muted">
                <li className="flex gap-2"><span className="text-red-400 shrink-0">✕</span> Buyer leaves Telegram</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">✕</span> Opens unknown payment page</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">✕</span> Creates account or enters email</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">✕</span> Enters credit card manually</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">✕</span> Waits for email delivery</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">✕</span> Extra steps to measure in your funnel</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-site-accent/30 bg-site-bg" style={{ boxShadow: '0 0 20px rgba(42, 171, 238, 0.05)' }}>
              <h3 className="font-bold mb-2 text-site-accent">Gategram (native Stars)</h3>
              <ul className="space-y-2 text-sm text-site-muted">
                <li className="flex gap-2"><span className="text-green-400 shrink-0">✓</span> Buyer stays in Telegram</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">✓</span> Native payment dialog</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">✓</span> No account needed</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">✓</span> One-tap Telegram Stars</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">✓</span> Automatic in-chat delivery</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">✓</span> Funnel events visible to the creator</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 site-panel text-sm text-site-muted">
            <p className="font-semibold text-site-text mb-2">References</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Telegram Stars native payment documentation. <a className="text-site-accent underline" href="https://core.telegram.org/bots/payments-stars" target="_blank" rel="noopener noreferrer">Source</a></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Telegram paywall pricing</h2>
          <p className="text-site-muted text-sm mb-6 leading-relaxed">
            Gategram charges at most 5% on each successful sale, rounded down to whole Stars. There is no monthly or setup fee, so at least 95% is credited to the creator&rsquo;s Gategram balance.
            Buyers confirm the Stars amount using Telegram&rsquo;s native invoice dialog.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="site-panel text-center">
              <p className="text-3xl font-extrabold text-site-accent">95%</p>
              <p className="text-sm text-site-muted mt-1">Minimum creator share</p>
            </div>
            <div className="site-panel text-center">
              <p className="text-3xl font-extrabold text-site-accent">$0</p>
              <p className="text-sm text-site-muted mt-1">Monthly fee</p>
            </div>
            <div className="site-panel text-center">
              <p className="text-3xl font-extrabold text-site-accent">2 min</p>
              <p className="text-sm text-site-muted mt-1">Setup time</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">Telegram paywall FAQ</h2>
          {faqs.map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Launch your Telegram paywall"
        description="Create a paid offer in minutes with native Stars checkout, automated delivery, and at least a 95% creator share."
        primary="Open Gategram"
        primaryHref="https://t.me/gategramapp_bot"
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
