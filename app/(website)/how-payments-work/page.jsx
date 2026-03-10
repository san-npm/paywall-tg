import PageHeader, { PageCTA } from '../../../components/website/PageHeader';

export const metadata = {
  title: 'How Payments Work — PayGate',
  description: 'Understand how PayGate processes payments through Telegram Stars. From purchase to delivery, every step explained.',
};

export default function HowPaymentsWork() {
  const steps = [
    {
      num: '1',
      title: 'Buyer taps your product link',
      desc: 'When someone clicks your PayGate buy link inside Telegram, the bot shows them the product details — title, description, and price in Stars.',
    },
    {
      num: '2',
      title: 'Telegram presents the native payment dialog',
      desc: 'Telegram\'s built-in Stars payment dialog appears. This is the same native dialog used by any Telegram Stars payment. The buyer sees the amount and taps "Pay". If they don\'t have enough Stars, Telegram prompts them to purchase Stars via Apple Pay or Google Pay.',
    },
    {
      num: '3',
      title: 'Telegram processes the payment',
      desc: 'The Stars transaction is processed entirely by Telegram\'s infrastructure. PayGate never sees or handles payment credentials. Telegram deducts Stars from the buyer and holds them for the creator.',
    },
    {
      num: '4',
      title: 'PayGate receives the confirmation webhook',
      desc: 'Telegram sends a pre_checkout_query and then a successful_payment webhook to PayGate. We validate the webhook signature to confirm it\'s genuinely from Telegram (not spoofed), verify the payment amount matches the product price, and confirm the transaction.',
    },
    {
      num: '5',
      title: 'Content is delivered instantly',
      desc: 'The moment payment is confirmed, PayGate sends the purchased content to the buyer as a Telegram message. Text, links, and files are delivered directly in the chat. This happens within seconds of payment.',
    },
    {
      num: '6',
      title: 'Stars are available for withdrawal',
      desc: 'The Stars (minus Telegram\'s 5% fee) are available in the creator\'s Telegram Stars balance. Creators can withdraw Stars according to Telegram\'s payout policies.',
    },
  ];

  return (
    <>
      <PageHeader
        badge="Trust"
        title="How payments work"
        description="Every PayGate transaction uses Telegram's native Stars payment system. Here's exactly what happens from the buyer's tap to content delivery."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-4 p-6 rounded-xl border border-site-border bg-site-card">
                <div className="w-10 h-10 rounded-full bg-site-accent/10 text-site-accent flex items-center justify-center font-bold text-lg shrink-0 border border-site-accent/20">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-site-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">What PayGate never does</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Never stores payment credentials',
              'Never processes card numbers',
              'Never accesses buyer bank details',
              'Never holds funds directly',
              'Never shares buyer data with third parties',
              'Never requires buyers to create accounts',
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-center p-4 rounded-xl border border-site-border bg-site-bg">
                <span className="text-red-400 shrink-0 font-bold">&#10005;</span>
                <p className="text-sm text-site-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently asked</h2>
          <div className="space-y-4">
            {[
              { q: 'What are Telegram Stars?', a: 'Stars are Telegram\'s built-in digital currency. Users buy them via Apple Pay or Google Pay within the Telegram app. Creators receive Stars as payment and can withdraw them.' },
              { q: 'Can buyers get a refund?', a: 'Telegram handles refund policies for Stars transactions. PayGate follows Telegram\'s guidelines for digital goods refunds.' },
              { q: 'How do I withdraw my earnings?', a: 'Stars are collected in your Telegram creator balance. Telegram provides withdrawal options according to their payout schedule and methods.' },
              { q: 'Is there a minimum payout?', a: 'Payout minimums and schedules are determined by Telegram\'s Stars program. Check Telegram\'s official documentation for current thresholds.' },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-xl border border-site-border bg-site-card">
                <h3 className="font-bold mb-2">{faq.q}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCTA secondary="See security details" secondaryHref="/security" />
    </>
  );
}
