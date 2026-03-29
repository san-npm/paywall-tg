import Link from 'next/link';
import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'How to Sell Products on Telegram (Step-by-Step Guide)',
  description: 'Learn how to sell digital products, paid content, and community access on Telegram using native Stars checkout. Set up in under 2 minutes.',
  path: '/how-to-sell-on-telegram',
  keywords: [
    'how to sell products on telegram',
    'selling on telegram',
    'sell on telegram',
    'how to sell on telegram',
    'telegram selling guide',
    'sell digital products telegram',
    'telegram commerce',
  ],
});

export default function HowToSellOnTelegram() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'How to Sell on Telegram', item: `${SITE_URL}/how-to-sell-on-telegram` },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to sell products on Telegram',
    description: 'Set up a Telegram store and start selling digital products with native Stars checkout in under 2 minutes.',
    totalTime: 'PT2M',
    tool: [{ '@type': 'HowToTool', name: 'Gategram Telegram bot' }],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Open the Gategram bot in Telegram',
        text: 'Search for @gategram_bot in Telegram or tap the link on gategram.app. The bot opens directly in Telegram — no signup required.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Create your first product',
        text: 'Set a title, set the price in Telegram Stars, and paste your content: text, a link, or upload a file.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Share the buy link',
        text: 'Drop the link in your Telegram channel, group, or DMs. Anyone who taps it sees the native purchase flow.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Buyers pay and receive instantly',
        text: 'Buyers confirm with one tap using Stars (powered by Apple Pay / Google Pay). Content is delivered immediately as a Telegram message.',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What can I sell on Telegram?',
        acceptedAnswer: { '@type': 'Answer', text: 'You can sell digital products (ebooks, templates, files), paid content (signals, analysis, tutorials), community access (private groups/channels), and courses. Any content that can be delivered as text, file, or invite link works.' },
      },
      {
        '@type': 'Question',
        name: 'How do Telegram Stars payments work?',
        acceptedAnswer: { '@type': 'Answer', text: 'Telegram Stars is Telegram\'s native payment currency. Buyers purchase Stars through Apple Pay or Google Pay inside the app. When they buy your product, they confirm with one tap — no credit card form, no redirect.' },
      },
      {
        '@type': 'Question',
        name: 'How much does it cost to sell on Telegram?',
        acceptedAnswer: { '@type': 'Answer', text: 'Gategram charges a 5% platform fee. You keep 95% of every sale. There are no monthly fees, setup costs, or hidden charges.' },
      },
      {
        '@type': 'Question',
        name: 'Do I need a website to sell on Telegram?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. Everything happens inside Telegram. You create products through the bot, share links in your channels or groups, and buyers pay without leaving the app.' },
      },
      {
        '@type': 'Question',
        name: 'Is selling on Telegram better than using Gumroad or Patreon?',
        acceptedAnswer: { '@type': 'Answer', text: 'If your audience is already on Telegram, yes. External checkout pages cause 40-60% drop-off because buyers leave the app. With native Stars checkout, buyers pay in one tap without leaving Telegram, leading to significantly higher conversion rates.' },
      },
    ],
  };

  const sellOptions = [
    {
      icon: '📦',
      title: 'Digital products',
      desc: 'Ebooks, templates, design assets, software licenses, files of any kind.',
      link: '/use-cases/sell-digital-products-on-telegram',
      linkText: 'Sell digital products',
    },
    {
      icon: '🔒',
      title: 'Paid content',
      desc: 'Trading signals, crypto alpha, exclusive analysis, predictions, research reports.',
      link: '/use-cases/telegram-paid-content',
      linkText: 'Sell paid content',
    },
    {
      icon: '👥',
      title: 'Community access',
      desc: 'Private groups, premium channels, mastermind communities, coaching groups.',
      link: '/community-access',
      linkText: 'Sell community access',
    },
    {
      icon: '🎓',
      title: 'Courses & lessons',
      desc: 'Online courses, tutorials, drip content, coaching programs.',
      link: '/use-cases/sell-courses-on-telegram',
      linkText: 'Sell courses',
    },
  ];

  const steps = [
    {
      num: '1',
      title: 'Open the Gategram bot',
      desc: 'Search @gategram_bot in Telegram or tap "Start selling" below. No account creation, no signup form.',
    },
    {
      num: '2',
      title: 'Create a product',
      desc: 'Give it a title, set a price in Stars, and add your content — text, a link, or a file upload.',
    },
    {
      num: '3',
      title: 'Share the buy link',
      desc: 'Post it in your channel, group, bio, or DMs. The link opens a native purchase flow inside Telegram.',
    },
    {
      num: '4',
      title: 'Get paid automatically',
      desc: 'Buyers pay with Stars (Apple Pay / Google Pay). Content is delivered instantly as a message. You keep 95%.',
    },
  ];

  const whyTelegram = [
    { stat: '950M+', label: 'Monthly active Telegram users' },
    { stat: '1 tap', label: 'Native Stars checkout — no redirect' },
    { stat: '95%', label: 'Creator payout on every sale' },
    { stat: '<2 min', label: 'From zero to first product live' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        badge="Guide"
        title={<>How to sell products on <span className="text-site-accent">Telegram</span></>}
        description="Set up a Telegram store in under 2 minutes. Sell digital products, paid content, and community access with native Stars checkout."
      />

      {/* Why Telegram */}
      <section className="py-12 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {whyTelegram.map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-3xl font-bold text-site-accent mb-1">{item.stat}</div>
                <p className="text-sm text-site-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you can sell */}
      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">What you can sell on Telegram</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sellOptions.map((opt) => (
              <div key={opt.title} className="p-6 rounded-xl border border-site-border bg-site-card">
                <div className="text-2xl mb-3">{opt.icon}</div>
                <h3 className="font-bold mb-2">{opt.title}</h3>
                <p className="text-sm text-site-muted mb-3 leading-relaxed">{opt.desc}</p>
                <Link href={opt.link} className="text-sm text-site-accent hover:underline">
                  {opt.linkText} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step-by-step */}
      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How to start selling in 4 steps</h2>
          <ol className="space-y-4">
            {steps.map((s) => (
              <li key={s.num} className="flex gap-4 p-5 rounded-xl border border-site-border bg-site-bg">
                <div className="w-8 h-8 rounded-full bg-site-accent text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {s.num}
                </div>
                <div>
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="text-sm text-site-muted">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* External vs native */}
      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Why selling inside Telegram converts better</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-site-border bg-site-card">
              <h3 className="font-bold mb-2 text-red-400">External checkout (Gumroad, Stripe, etc.)</h3>
              <ul className="space-y-2 text-sm text-site-muted">
                <li className="flex gap-2"><span className="text-red-400 shrink-0">&#10005;</span> Buyer leaves Telegram</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">&#10005;</span> Unknown payment page</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">&#10005;</span> Account creation + email</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">&#10005;</span> Credit card form</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">&#10005;</span> 40-60% abandon at checkout</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-site-accent/30 bg-site-card" style={{ boxShadow: '0 0 20px rgba(42, 171, 238, 0.05)' }}>
              <h3 className="font-bold mb-2 text-site-accent">Native Stars checkout (Gategram)</h3>
              <ul className="space-y-2 text-sm text-site-muted">
                <li className="flex gap-2"><span className="text-green-400 shrink-0">&#10003;</span> Buyer stays in Telegram</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">&#10003;</span> Native payment dialog</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">&#10003;</span> No account needed</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">&#10003;</span> Apple Pay / Google Pay</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">&#10003;</span> Instant in-chat delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">FAQ: selling on Telegram</h2>
          {faqSchema.mainEntity.map((item) => (
            <div key={item.name} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.name}</strong><br />{item.acceptedAnswer.text}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Ready to start selling on Telegram?"
        description="Create your first product in under 2 minutes. No signup, no website needed."
        primary="Start selling"
        primaryHref="/docs#connect-bot"
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
