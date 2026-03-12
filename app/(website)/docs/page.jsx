import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Telegram Paywall Documentation',
  description: 'Step-by-step docs to set up a Telegram paywall and monetize your community access with Stars payments.',
  path: '/docs',
  keywords: ['telegram paywall docs', 'telegram stars setup'],
});

export default function DocsPage() {
  return (
    <>
      <PageHeader
        badge="Quickstart"
        title="Start selling in minutes"
        description="No technical setup. Just connect your bot, create your first paid content, and share your link."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              n: '1',
              title: 'Connect your Telegram bot',
              desc: 'Use your own bot token and webhook. If you need help, follow the setup steps in this page and test with /start.',
            },
            {
              n: '2',
              title: 'Create your first paid content',
              desc: 'Set a title, choose a Stars price, then add text, link, message, or file content.',
            },
            {
              n: '3',
              title: 'Share your buy link',
              desc: 'Post your buy link in your Telegram channel, group, or DMs. Buyers pay in chat and get content instantly.',
            },
            {
              n: '4',
              title: 'Track performance',
              desc: 'Use dashboard stats to see views, sales, and earnings. Improve title/price based on what converts.',
            },
          ].map((step) => (
            <article key={step.n} className="site-panel flex gap-4">
              <div className="w-8 h-8 rounded-full bg-site-accent/15 text-site-accent flex items-center justify-center font-bold text-sm shrink-0">{step.n}</div>
              <div>
                <h3 className="font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-site-muted">{step.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Useful commands</h2>
          <div className="rounded-xl border border-site-border overflow-hidden">
            {[
              { cmd: '/start', desc: 'Initialize your account in bot chat' },
              { cmd: '/new <price> <title> | <content>', desc: 'Create a quick paid content item' },
              { cmd: '/attach <id>', desc: 'Attach file to a file-type item' },
              { cmd: '/buy <id>', desc: 'Open purchase flow for an item' },
            ].map((item, i) => (
              <div key={item.cmd} className={`flex gap-4 p-4 text-sm ${i % 2 === 0 ? 'bg-site-bg' : 'bg-site-card'}`}>
                <code className="font-mono text-site-accent min-w-[220px]">{item.cmd}</code>
                <span className="text-site-muted">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Secret rotation runbook</h2>
          <div className="space-y-3 text-sm text-site-muted">
            <div className="site-panel">
              <p><strong className="text-site-text">1) Rotate BOT_TOKEN</strong><br/>Create a new bot token in BotFather, update `BOT_TOKEN` in deployment secrets, redeploy, and confirm `/start` plus invoice flow still work.</p>
            </div>
            <div className="site-panel">
              <p><strong className="text-site-text">2) Rotate WEBHOOK_SECRET</strong><br/>Generate a new random secret, update webhook configuration in Telegram, update deployment secret, then verify webhook requests are accepted.</p>
            </div>
            <div className="site-panel">
              <p><strong className="text-site-text">3) Rotate Turso credentials</strong><br/>Issue a new DB auth token, update `TURSO_AUTH_TOKEN`, redeploy, and run a read/write smoke test from dashboard and purchase endpoints.</p>
            </div>
            <div className="site-panel">
              <p><strong className="text-site-text">4) Validate + rollback plan</strong><br/>Track error rates for 15 minutes post-rotation. Keep previous secrets available for quick rollback if auth/webhook verification fails.</p>
            </div>
          </div>
        </div>
      </section>

      <PageCTA
        title="Ready to launch your first paid drop?"
        description="Create it, share it, get paid in Telegram Stars."
        secondary="See pricing"
        secondaryHref="/fees"
      />
    </>
  );
}
