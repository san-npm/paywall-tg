import Link from 'next/link';
import EmailCapture from '../../components/website/EmailCapture';

export const metadata = {
  title: 'PayGate — Sell Digital Content on Telegram',
  description: 'Native Telegram checkout + instant delivery + 95/5 split. Sell digital products, paid content, and files directly inside Telegram. No external accounts.',
};

function Hero() {
  return (
    <section className="py-20 md:py-32 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-site-border text-site-muted mb-6">
          Telegram-native payments &middot; 95/5 split
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          Sell anything inside
          <span className="text-site-accent"> Telegram</span>
        </h1>
        <p className="text-lg md:text-xl text-site-muted max-w-2xl mx-auto mb-8 leading-relaxed">
          Your buyer never leaves the chat. Native Stars checkout, instant delivery,
          no external accounts. You keep 95%.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="https://t.me/PayGateBot"
            className="px-6 py-3 rounded-lg bg-site-accent text-white font-semibold text-base hover:bg-site-accent-hover transition-colors animate-pulse-glow"
          >
            Create your first paid product
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 rounded-lg border border-site-border text-site-muted font-medium text-base hover:text-site-text hover:border-site-muted transition-colors"
          >
            See live buy flow
          </Link>
        </div>
        <p className="mt-6 text-sm text-site-dim">
          Free to start. No credit card needed. Live in 2 minutes.
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Create',
      desc: 'Set a title, price in Stars, and paste your content. Text, links, files — anything digital.',
      icon: (
        <svg className="w-8 h-8 text-site-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Share',
      desc: 'Drop the buy link in any chat, channel, or group. One tap opens the native purchase flow.',
      icon: (
        <svg className="w-8 h-8 text-site-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Get paid',
      desc: 'Buyer pays with Stars inside Telegram. Content delivered instantly. You get 95%, Telegram gets 5%.',
      icon: (
        <svg className="w-8 h-8 text-site-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 px-4 border-t border-site-border">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How it works</h2>
        <p className="text-site-muted text-center mb-12 max-w-lg mx-auto">
          From zero to selling in under 2 minutes. No setup fees, no approval process.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="p-6 rounded-xl border border-site-border bg-site-card">
              <div className="flex items-center gap-3 mb-4">
                {step.icon}
                <span className="text-xs font-mono text-site-dim">{step.num}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-site-muted text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyTelegramNative() {
  const points = [
    {
      title: 'Zero redirect friction',
      desc: 'Buyer taps "Buy" inside the chat. No browser opens, no login wall, no cart page. The purchase happens where the conversation is.',
    },
    {
      title: 'Stars are already loaded',
      desc: 'Telegram users buy Stars directly from Apple/Google. When they hit your product, payment is one tap — not "enter card details on a page they don\'t trust."',
    },
    {
      title: 'Instant delivery in-chat',
      desc: 'Content arrives as a message the moment payment clears. No "check your email" dead ends. No download links that expire.',
    },
    {
      title: 'Trust is inherited',
      desc: 'Your buyer trusts Telegram. They don\'t trust your random Gumroad page. The native flow inherits that trust automatically.',
    },
  ];

  return (
    <section className="py-20 px-4 border-t border-site-border bg-site-elevated">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Why Telegram-native beats external checkouts
        </h2>
        <p className="text-site-muted text-center mb-12 max-w-lg mx-auto">
          Every redirect is a lost sale. Stop sending your audience away.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {points.map((p, i) => (
            <div key={i} className="p-6 rounded-xl border border-site-border bg-site-bg">
              <h3 className="text-lg font-bold mb-2">{p.title}</h3>
              <p className="text-site-muted text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Proof() {
  const stats = [
    { value: '2 min', label: 'Average setup time' },
    { value: '95%', label: 'Revenue to you' },
    { value: '<3s', label: 'Delivery after payment' },
    { value: '0', label: 'External accounts needed' },
  ];

  return (
    <section className="py-20 px-4 border-t border-site-border">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Built for real Telegram creators
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((s, i) => (
            <div key={i} className="text-center p-6 rounded-xl border border-site-border bg-site-card">
              <p className="text-3xl md:text-4xl font-bold text-site-accent mb-1">{s.value}</p>
              <p className="text-sm text-site-muted">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-site-border bg-site-card">
            <p className="text-site-text text-sm mb-3 leading-relaxed">
              &ldquo;I was sending people to a Gumroad link from my channel. Conversion was trash.
              Switched to PayGate — same audience, 3x more sales. They just buy right in the chat.&rdquo;
            </p>
            <p className="text-xs text-site-dim">— Channel owner, 12k subscribers</p>
          </div>
          <div className="p-5 rounded-xl border border-site-border bg-site-card">
            <p className="text-site-text text-sm mb-3 leading-relaxed">
              &ldquo;Setup took literally 2 minutes. Created a product, shared the link in my group,
              first sale came in 10 minutes later. No config, no webhook setup, nothing.&rdquo;
            </p>
            <p className="text-xs text-site-dim">— Digital course creator</p>
          </div>
          <div className="p-5 rounded-xl border border-site-border bg-site-card">
            <p className="text-site-text text-sm mb-3 leading-relaxed">
              &ldquo;The 95/5 split is insane compared to Gumroad&rsquo;s 10%. And my buyers love
              that they don&rsquo;t need to create an account anywhere. Stars just work.&rdquo;
            </p>
            <p className="text-xs text-site-dim">— Template seller</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompetitorContrast() {
  const rows = [
    { feature: 'Checkout location', paygate: 'Inside Telegram', others: 'External website' },
    { feature: 'Buyer account needed', paygate: 'No', others: 'Yes (email + password)' },
    { feature: 'Delivery speed', paygate: 'Instant (in-chat)', others: 'Email (minutes/hours)' },
    { feature: 'Revenue split', paygate: '95/5', others: '70-90%' },
    { feature: 'Setup time', paygate: '2 minutes', others: '15-60 minutes' },
    { feature: 'Payment method', paygate: 'Telegram Stars (Apple/Google Pay)', others: 'Credit card form' },
    { feature: 'Telegram integration', paygate: 'Native', others: 'Link out' },
    { feature: 'Mobile conversion', paygate: 'One-tap', others: 'Multi-step checkout' },
  ];

  return (
    <section className="py-20 px-4 border-t border-site-border bg-site-elevated">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          PayGate vs the old way
        </h2>
        <p className="text-site-muted text-center mb-10 max-w-lg mx-auto">
          InviteMember, Gumroad, LemonSqueezy — they all send your buyer away from Telegram.
        </p>
        <div className="rounded-xl border border-site-border overflow-hidden">
          <div className="grid grid-cols-3 text-sm font-semibold bg-site-card">
            <div className="p-3 md:p-4 text-site-dim">Feature</div>
            <div className="p-3 md:p-4 text-site-accent">PayGate</div>
            <div className="p-3 md:p-4 text-site-dim">Others</div>
          </div>
          {rows.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-site-bg' : 'bg-site-card'}`}>
              <div className="p-3 md:p-4 text-site-muted">{row.feature}</div>
              <div className="p-3 md:p-4 text-site-text font-medium">{row.paygate}</div>
              <div className="p-3 md:p-4 text-site-dim">{row.others}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/vs/invitemember" className="text-sm text-site-accent hover:underline">PayGate vs InviteMember &rarr;</Link>
          <Link href="/alternatives/gumroad-for-telegram" className="text-sm text-site-accent hover:underline">Gumroad alternative &rarr;</Link>
          <Link href="/alternatives/lemon-squeezy-telegram" className="text-sm text-site-accent hover:underline">LemonSqueezy alternative &rarr;</Link>
        </div>
      </div>
    </section>
  );
}

function CTARepeat() {
  return (
    <section className="py-20 px-4 border-t border-site-border">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to sell inside Telegram?
        </h2>
        <p className="text-site-muted mb-8 max-w-md mx-auto">
          Create your first product in 2 minutes. No setup fees, no approval, no external accounts.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="https://t.me/PayGateBot"
            className="px-6 py-3 rounded-lg bg-site-accent text-white font-semibold text-base hover:bg-site-accent-hover transition-colors"
          >
            Create your first paid product
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 rounded-lg border border-site-border text-site-muted font-medium text-base hover:text-site-text hover:border-site-muted transition-colors"
          >
            Read the docs
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <WhyTelegramNative />
      <Proof />
      <CompetitorContrast />
      <EmailCapture />
      <CTARepeat />
    </>
  );
}
