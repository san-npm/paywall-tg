import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Sell Online Courses on Telegram',
  description: 'Sell course modules, lessons, and educational content on Telegram with instant Stars checkout. No LMS needed, no monthly platform fees.',
  path: '/use-cases/sell-courses-on-telegram',
  keywords: ['sell courses telegram', 'telegram course monetization', 'online course telegram'],
});

export default function SellCoursesOnTelegram() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Use Cases', item: 'https://www.gategram.app/use-cases/sell-courses-on-telegram' },
      { '@type': 'ListItem', position: 3, name: 'Sell Online Courses on Telegram', item: 'https://www.gategram.app/use-cases/sell-courses-on-telegram' },
    ],
  };

  const products = [
    { icon: '📚', name: 'Course Modules', desc: 'Sell individual lessons or full modules as paid content. Buyers unlock each section with a single tap.' },
    { icon: '🎥', name: 'Video Lessons', desc: 'Upload video files or share private video links. Delivered instantly after Stars payment.' },
    { icon: '📝', name: 'Worksheets & Exercises', desc: 'Sell PDF worksheets, templates, and practice materials alongside your course content.' },
    { icon: '🔑', name: 'Full Course Access', desc: 'Gate your private course channel. Paying students get access to all materials in one place.' },
    { icon: '💬', name: 'Live Q&A Access', desc: 'Charge for access to live Q&A sessions, office hours, or coaching calls in private groups.' },
    { icon: '📋', name: 'Resource Bundles', desc: 'Package slides, notes, cheat sheets, and bonus materials into paid bundles.' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PageHeader
        badge="Use Case"
        title={<>Sell online courses on <span className="text-site-accent">Telegram</span> — no LMS required</>}
        description="Skip expensive course platforms. Sell lessons, modules, and educational content directly to students on Telegram."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">What you can sell</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <div key={i} className="p-5 rounded-xl border border-site-border bg-site-card">
                <div className="text-2xl mb-3">{p.icon}</div>
                <h3 className="font-bold mb-1">{p.name}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">The problem with course platforms</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-red-400">LMS platforms are expensive and complex</h3>
              <p className="text-sm text-site-muted">Teachable, Thinkific, Kajabi — they charge $39-149/month before you make a single sale. You spend weeks building the course page, setting up drip schedules, configuring payment processors. Most solo educators don't need any of that.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-red-400">Students drop off between platforms</h3>
              <p className="text-sm text-site-muted">You promote on Telegram, send students to a course platform, they need to create an account, verify email, enter payment. Each step loses people. The students who'd pay for your content never make it to checkout.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-green-400">With Gategram: sell where your students already are</h3>
              <p className="text-sm text-site-muted">Your students follow you on Telegram. Sell course modules as paid content — they tap Buy, confirm with Stars, and get the lesson delivered instantly. No platform switch, no account creation, no lost students.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How to start selling courses</h2>
          <ol className="space-y-4">
            {[
              { step: '1', title: 'Open the Gategram bot', desc: 'Tap "Create your first product" below. The bot opens inside Telegram.' },
              { step: '2', title: 'Create your first lesson', desc: 'Set a title like "Module 1: Foundations", price in Stars, and upload your content (PDF, video link, or text).' },
              { step: '3', title: 'Share with your audience', desc: 'Post the buy link in your channel with a preview of what students will learn in this module.' },
              { step: '4', title: 'Scale your catalog', desc: 'Add more modules, bonus materials, and resource bundles. Each product has its own buy link.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 p-5 rounded-xl border border-site-border bg-site-card">
                <div className="w-8 h-8 rounded-full bg-site-accent text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="text-sm text-site-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </ol>
        </div>
      </section>

      <PageCTA
        title="Skip the $149/month course platform"
        description="Sell lessons directly on Telegram. No LMS, no monthly fees, just content and checkout."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See pricing"
        secondaryHref="/fees"
      />
    </>
  );
}
