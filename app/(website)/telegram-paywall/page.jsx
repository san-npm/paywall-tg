import Link from 'next/link';
import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata, jsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Telegram Paywall for Paid Communities & Content',
  description: 'Set up a Telegram paywall with native Stars checkout. Sell paid content, gate community access, and deliver instantly — without sending buyers to external pages.',
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
      text: 'Open Gategram in Telegram and connect your bot. There is no coding, no Stripe account, and no external dashboard to configure.',
    },
    {
      name: 'Create a paid offer',
      text: 'Set a title, choose your price in Telegram Stars (anywhere from 1 to 10,000 Stars), and add the content you want to gate — text, links, files, or a private group invite.',
    },
    {
      name: 'Share the buy link',
      text: 'Post the buy link in your channel, group, or DMs. Pin it or add it to your channel description so it keeps selling on autopilot.',
    },
    {
      name: 'Buyers pay and unlock instantly',
      text: 'A buyer taps the link, confirms with one tap in the native Telegram Stars dialog, and receives the content as a message instantly. You keep 95% of every sale.',
    },
  ];

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to set up a Telegram paywall',
    description: 'Set up a Telegram paywall with Gategram using native Telegram Stars checkout. No coding, no Stripe, about 2 minutes.',
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
      a: 'With Gategram, connect the bot, create a paid offer (title, price in Stars, content), and share the buy link in your channel or group. No coding, no Stripe configuration. Setup takes about 2 minutes.',
    },
    {
      q: 'Does a Telegram paywall work for one-time sales?',
      a: 'Yes. Gategram supports one-time paid content, digital product drops, and access offers. You are not limited to subscription models — any piece of content can be sold individually.',
    },
    {
      q: 'What happens when a buyer pays?',
      a: 'The buyer taps the buy link inside Telegram, confirms payment with one tap via Telegram Stars (backed by Apple Pay and Google Pay), and the content or access is delivered instantly as a Telegram message.',
    },
    {
      q: 'How much does a Telegram paywall cost?',
      a: 'Gategram charges a flat 5% fee per sale. No monthly fee, no setup fee. You keep 95% of every transaction.',
    },
    {
      q: 'Can I sell files, links, and text behind a paywall?',
      a: 'Yes. You can sell any digital content: text posts, file downloads, links, access credentials, and invite links to private groups — all delivered instantly after payment.',
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
        description="Creators publish paid access. Buyers pay with Telegram Stars and unlock instantly — without leaving Telegram."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">What a Telegram paywall should actually do</h2>
          <p className="text-site-muted text-sm leading-relaxed">
            Most paywall setups for Telegram send your buyer to an external checkout page — Stripe, PayPal, Gumroad, or a custom payment link.
            The buyer leaves Telegram, lands on an unknown page, creates an account, enters a credit card, and waits for a confirmation email.
            According to <a className="text-site-accent underline" href="https://baymard.com/lists/cart-abandonment-rate" target="_blank" rel="noopener noreferrer">Baymard Institute research</a>, average checkout abandonment rates sit around 70%. Most of those lost sales aren't about price — they're about friction.
          </p>
          <p className="text-site-muted text-sm leading-relaxed">
            A properly built Telegram paywall eliminates that friction entirely. The payment dialog is native to the Telegram app. The buyer confirms with one tap. Content is delivered as a message the instant payment clears.
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
              <p className="text-sm text-site-muted">Set a title, choose your Stars price, and add the content you want to sell — text, links, files, or access credentials. Takes under 2 minutes.</p>
            </article>
            <article className="site-step">
              <span className="site-step-n">02</span>
              <h3 className="text-lg font-bold mb-2">Share the buy link</h3>
              <p className="text-sm text-site-muted">Post the link in your Telegram channel, group, or DMs. You can also pin it or include it in your channel description for ongoing sales.</p>
            </article>
            <article className="site-step">
              <span className="site-step-n">03</span>
              <h3 className="text-lg font-bold mb-2">Buyer pays, content unlocks</h3>
              <p className="text-sm text-site-muted">The buyer taps your link, sees the native Telegram Stars payment dialog, confirms with one tap, and receives the content as a message instantly.</p>
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
              { title: 'Instant delivery', desc: 'Content or the group invite should be delivered as a Telegram message the moment payment confirms — no manual steps, no email.' },
              { title: 'No buyer account required', desc: 'Buyers should pay with one tap via Stars (backed by Apple Pay and Google Pay). No sign-up, no card form, no new account.' },
              { title: 'Transparent fees', desc: 'Look for a clear, flat fee. Gategram charges 5% per sale with no monthly cost, so you keep 95% of every transaction.' },
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
              { title: 'Private group access', desc: 'Gate your private Telegram group or channel. Buyers pay and receive an invite link delivered instantly.' },
              { title: 'Trading signals & alpha', desc: 'Sell individual signal drops, market analyses, or weekly research packages to your trading community.' },
              { title: 'Digital products & files', desc: 'Ebooks, templates, presets, design assets, courses — any file delivered as a Telegram message after payment.' },
              { title: 'Exclusive content drops', desc: 'One-time content like early access tracks, unreleased material, or limited-edition digital items.' },
              { title: 'Consulting & access slots', desc: 'Sell time slots, AMA access, or 1-on-1 consulting links with instant paid delivery.' },
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
                <li className="flex gap-2"><span className="text-red-400 shrink-0">✕</span> ~70% abandon at checkout</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-site-accent/30 bg-site-bg" style={{ boxShadow: '0 0 20px rgba(42, 171, 238, 0.05)' }}>
              <h3 className="font-bold mb-2 text-site-accent">Gategram (native Stars)</h3>
              <ul className="space-y-2 text-sm text-site-muted">
                <li className="flex gap-2"><span className="text-green-400 shrink-0">✓</span> Buyer stays in Telegram</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">✓</span> Native payment dialog</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">✓</span> No account needed</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">✓</span> One-tap Stars (Apple Pay / Google Pay)</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">✓</span> Instant in-chat delivery</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">✓</span> Minimal drop-off</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 site-panel text-sm text-site-muted">
            <p className="font-semibold text-site-text mb-2">References</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Baymard Institute: average online checkout abandonment rate is 70.19% across 49 studies. <a className="text-site-accent underline" href="https://baymard.com/lists/cart-abandonment-rate" target="_blank" rel="noopener noreferrer">Source</a></li>
              <li>Telegram Stars native payment documentation. <a className="text-site-accent underline" href="https://core.telegram.org/bots/payments-stars" target="_blank" rel="noopener noreferrer">Source</a></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Telegram paywall pricing</h2>
          <p className="text-site-muted text-sm mb-6 leading-relaxed">
            Gategram charges a flat 5% platform fee on each successful sale. No monthly fee, no setup fee, no hidden costs. You keep 95% of every transaction.
            Stars are backed by Apple Pay and Google Pay, so your buyers can pay with one tap on mobile.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="site-panel text-center">
              <p className="text-3xl font-extrabold text-site-accent">95%</p>
              <p className="text-sm text-site-muted mt-1">Creator payout</p>
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
        description="Create your first paid offer in under 2 minutes. Native Stars checkout, instant delivery, 95% payout."
        primary="Start in 2 minutes"
        primaryHref="https://t.me/gategramapp_bot"
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
