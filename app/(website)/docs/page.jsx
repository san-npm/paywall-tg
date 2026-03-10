import PageHeader, { PageCTA } from '../../../components/website/PageHeader';

export const metadata = {
  title: 'Docs — Get Started Fast',
  description: 'Quick guide to start selling paid content in Telegram with PayGate.',
};

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

      <PageCTA
        title="Ready to launch your first paid drop?"
        description="Create it, share it, get paid in Telegram Stars."
        secondary="See pricing"
        secondaryHref="/fees"
      />
    </>
  );
}
