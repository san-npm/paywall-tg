import Link from 'next/link';
import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata, jsonLd } from '@/lib/seo';

const BOT_URL = 'https://t.me/gategramapp_bot';

export const metadata = buildPageMetadata({
  title: 'Gategram Quickstart — Set Up Your Telegram Paywall in Minutes',
  description: 'Open the Gategram bot, create your first paid item, share the link, and get paid in Telegram Stars or by card. No bot token, no code, no signup.',
  path: '/docs',
  keywords: ['telegram paywall setup', 'gategram quickstart', 'sell on telegram stars'],
});

export default function DocsPage() {
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to set up a Telegram paywall with Gategram',
    description: 'Open the Gategram bot, create a paid item, share your link, and get paid in Telegram Stars or by card — in minutes, no code.',
    totalTime: 'PT2M',
    tool: [{ '@type': 'HowToTool', name: 'Gategram Telegram bot (@gategramapp_bot)' }],
    step: [
      {
        '@type': 'HowToStep', position: 1, name: 'Open the Gategram bot',
        text: 'Open @gategramapp_bot in Telegram and tap Start. Then tap Open Gategram to launch the Mini App. No bot token, no webhook, no signup form.',
        url: 'https://gategram.app/docs#connect-bot',
      },
      {
        '@type': 'HowToStep', position: 2, name: 'Create your first paid item',
        text: 'Tap /create to open the form, or use the quick command /new price title | content. Set a title, a price in Telegram Stars (1 to 10,000), and your content: text, a link, a file (including photo or video), or a saved message.',
      },
      {
        '@type': 'HowToStep', position: 3, name: 'Share your link and get paid',
        text: 'Share your buy link (https://t.me/gategramapp_bot?start=buy_ID) in any channel, group, or DM. Buyers tap it, pay with Telegram Stars or by card in one tap, and receive the content instantly in chat. You keep 95% (5% fee).',
      },
      {
        '@type': 'HowToStep', position: 4, name: 'Manage your sales',
        text: 'Open /dashboard or the Mini App to view products, sales, and earnings.',
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Documentation', item: 'https://gategram.app/docs' },
    ],
  };

  const steps = [
    {
      n: '1', title: 'Open the bot',
      desc: 'Open @gategramapp_bot and tap Start, then tap Open Gategram to launch the Mini App. That’s your whole account — no signup form, no bot token, nothing to configure.',
    },
    {
      n: '2', title: 'Create your first paid item',
      desc: 'Tap /create to open the form (or use the quick command /new price title | content). Set a title, a price in Telegram Stars (1 to 10,000), and your content: text, a link, a file (photo, video, or document), or a saved message.',
    },
    {
      n: '3', title: 'Share your link and get paid',
      desc: 'You get a buy link like t.me/gategramapp_bot?start=buy_ID. Post it in any channel, group, or DM. Buyers tap it, pay with Telegram Stars or by card in one tap, and receive the content instantly in chat. You keep 95% (5% fee).',
    },
  ];

  const tasks = [
    {
      title: 'Sell a file, post, or guide',
      lede: 'A PDF, video, photo, a private link, a chunk of text, or a forwarded message — anything you can send in Telegram, you can sell.',
      steps: [
        'In the bot, tap /create to open the form (or type /new 50 My guide | your content for a quick text item).',
        'Set a title, a price in Stars (1 to 10,000), and add your content: text, a link, or a file/photo/video.',
        'Copy the buy link the bot gives you and post it in your channel, group, bio, or DMs. Buyers pay in one tap and get it instantly.',
      ],
    },
    {
      title: 'Gate a private group or channel',
      lede: 'Charge for entry to a private group or channel by selling its invite link behind a paywall.',
      steps: [
        'In Telegram, set your group or channel to private and copy its invite link.',
        'In the bot, tap /create, set a price, choose the link content type, and paste the invite link as the content.',
        'Share the buy link publicly. When someone pays, the bot delivers your invite link instantly and they join.',
      ],
    },
    {
      title: 'Sell ongoing community access',
      lede: 'Run a paid community with tiers — each tier is its own paid item with its own invite link.',
      steps: [
        'Create one private group or channel per tier (for example Monthly, VIP) and copy each invite link.',
        'In the bot, create one paid item per tier — set its price and paste that tier’s invite link as the content.',
        'Share each tier’s buy link. Buyers pick a tier, pay, and receive the matching invite link instantly.',
      ],
    },
  ];

  const commands = [
    { cmd: '/start', desc: 'Open the bot and get the Open Gategram button' },
    { cmd: '/create', desc: 'Open the creation form in the Mini App' },
    { cmd: '/new price title | content', desc: 'Quick-create a text item from one message' },
    { cmd: '/attach id', desc: 'Attach a file, photo, or video to a file-type item' },
    { cmd: '/products', desc: 'List the items you’ve created' },
    { cmd: '/dashboard', desc: 'View sales and earnings' },
    { cmd: '/buy id', desc: 'Open the purchase flow for an item' },
    { cmd: '/purchases', desc: 'View items you’ve bought' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <PageHeader
        badge="Quickstart"
        title="Set up your Telegram paywall in minutes"
        description="Open one bot, create a paid item, share the link. Buyers pay in Telegram Stars or by card and get it instantly. No bot token, no code, no signup form."
      />

      {/* Primary CTA — open the official bot (the key fix). Anchored at #connect-bot. */}
      <section id="connect-bot" className="py-16 px-4 border-b border-site-border scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <article className="site-panel text-center">
            <p className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-site-border text-site-muted mb-4">
              Start here
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Open the Gategram bot</h2>
            <p className="text-site-muted max-w-xl mx-auto mb-8 leading-relaxed">
              Everything happens inside one official bot — <strong className="text-site-text">@gategramapp_bot</strong>.
              There is no bot to build, no token to paste, and nothing to install. Tap below, hit Start,
              then tap <strong className="text-site-text">Open Gategram</strong> to launch the app.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={BOT_URL} className="site-cta-primary">Open the Gategram bot</Link>
              <Link href="#quickstart" className="site-cta-secondary">See the 3 steps</Link>
            </div>
            <p className="text-xs text-site-muted mt-5">
              Opens directly in Telegram · Free to start · Keep 95% of every sale
            </p>
          </article>
        </div>
      </section>

      {/* 3-step quickstart */}
      <section id="quickstart" className="py-16 px-4 border-b border-site-border bg-site-elevated scroll-mt-24">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold mb-2">Go live in 3 steps</h2>
            <p className="text-sm text-site-muted">From opening the bot to your first sale. No technical setup.</p>
          </div>
          {steps.map((step) => (
            <article key={step.n} className="site-panel flex gap-4">
              <div className="w-8 h-8 rounded-full bg-site-accent/15 text-site-accent flex items-center justify-center font-bold text-sm shrink-0">{step.n}</div>
              <div>
                <h3 className="font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{step.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* What you can sell — job-to-be-done cards */}
      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center">What do you want to sell?</h2>
          <p className="text-sm text-site-muted mb-10 text-center max-w-xl mx-auto">
            Same simple loop every time: create it in the bot, share a link, get paid in Telegram Stars or by card.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {tasks.map((t) => (
              <article key={t.title} className="site-panel flex flex-col">
                <h3 className="font-bold mb-1">{t.title}</h3>
                <p className="text-sm text-site-muted mb-4 leading-relaxed">{t.lede}</p>
                <ol className="space-y-2 text-sm text-site-muted mb-5">
                  {t.steps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-site-accent/15 text-site-accent flex items-center justify-center font-bold text-xs shrink-0">{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
                <Link href="#connect-bot" className="text-sm text-site-accent hover:underline mt-auto">Open the Gategram bot →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Honest community-gating explanation */}
      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">How gating a group really works</h2>
          <article className="site-panel text-sm text-site-muted leading-relaxed space-y-3">
            <p>
              Gating a private group or channel means <strong className="text-site-text">selling your private invite link behind a paywall</strong>.
              You create a paid item whose content is the invite link; when a buyer pays, the bot delivers that link instantly and they join.
            </p>
            <p className="text-site-text font-semibold">What Gategram does</p>
            <ul className="space-y-1.5 list-none">
              <li className="flex gap-2"><span className="text-site-accent shrink-0">✓</span> Takes the payment (Telegram Stars or card) inside Telegram.</li>
              <li className="flex gap-2"><span className="text-site-accent shrink-0">✓</span> Delivers your private invite link to the buyer the moment they pay.</li>
              <li className="flex gap-2"><span className="text-site-accent shrink-0">✓</span> Lets you run multiple tiers, each with its own price and invite link.</li>
            </ul>
            <p className="text-site-text font-semibold">What Gategram does not do</p>
            <ul className="space-y-1.5 list-none">
              <li className="flex gap-2"><span className="text-site-muted shrink-0">✕</span> It does not auto-add buyers to your group or auto-kick anyone.</li>
              <li className="flex gap-2"><span className="text-site-muted shrink-0">✕</span> It does not track membership, expirations, or renewals for you.</li>
              <li className="flex gap-2"><span className="text-site-muted shrink-0">✕</span> It does not sync who is in the group with who has paid.</li>
            </ul>
            <p>
              You stay in control of your group in Telegram. To limit reuse, use Telegram’s own invite-link controls
              (member limits, expiry, or revoking and re-issuing a link). Membership management stays in your hands; Gategram handles payment and instant delivery.
            </p>
          </article>
        </div>
      </section>

      {/* Optional bot commands */}
      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Bot commands (optional shortcuts)</h2>
          <p className="text-sm text-site-muted mb-6">You can do everything with the buttons in the bot. These commands are quicker if you like typing.</p>
          <div className="rounded-xl border border-site-border overflow-hidden">
            {commands.map((item, i) => (
              <div key={item.cmd} className={`flex gap-4 p-4 text-sm ${i % 2 === 0 ? 'bg-site-bg' : 'bg-site-card'}`}>
                <code className="font-mono text-site-accent min-w-[260px]">{item.cmd}</code>
                <span className="text-site-muted">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Self-hosting — demoted, developer-only, collapsed */}
      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <details className="site-panel group">
            <summary className="cursor-pointer font-bold flex items-center justify-between list-none">
              <span>Self-hosting Gategram (advanced, open-source)</span>
              <span className="text-site-muted text-sm group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="mt-4 text-sm text-site-muted leading-relaxed space-y-3">
              <p>
                <strong className="text-site-text">Most creators do not need this.</strong> The hosted bot above
                (<a href={BOT_URL} className="text-site-accent hover:underline">@gategramapp_bot</a>) is the whole
                product — nothing to deploy, no token, no webhook.
              </p>
              <p>
                Gategram is open source under the MIT license. Developers who want to run their own deployment use their own
                <code className="font-mono text-site-accent"> BOT_TOKEN</code>, webhook, and Turso database, and manage secret rotation themselves.
                That is a separate, technical path — the full setup, environment variables, and the secret-rotation runbook live in the repository.
              </p>
              <a href="https://github.com/san-npm/paywall-tg" className="inline-flex items-center gap-2 text-site-accent hover:underline font-medium">
                View the open-source repo on GitHub →
              </a>
            </div>
          </details>
        </div>
      </section>

      <PageCTA
        title="Ready to launch your first paid drop?"
        description="Open the bot, create it, share it, and get paid in Telegram Stars or by card. You keep 95%."
        primary="Open the Gategram bot"
        primaryHref={BOT_URL}
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
