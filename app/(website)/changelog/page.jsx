import PageHeader from '../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Gategram Changelog',
  description: 'Latest Telegram paywall and community monetization updates, releases, and improvements.',
  path: '/changelog',
  keywords: ['telegram monetization updates'],
});

export default function ChangelogPage() {
  const entries = [
    {
      date: '2026-03-10',
      version: 'v1.0',
      title: 'Public launch',
      changes: [
        'Native Telegram Stars payments for digital products',
        'Support for text, link, file, and message content types',
        'Instant in-chat delivery after payment',
        'Creator dashboard with product management',
        'Sales analytics and view tracking',
        'Product editing and deletion',
        'Share-to-Telegram integration',
        'File attachment support via /attach command',
        'HMAC-SHA256 webhook validation',
        'Rate limiting on all API endpoints',
        'Public website with docs, pricing, and comparison pages',
      ],
    },
  ];

  return (
    <>
      <PageHeader
        badge="Changelog"
        title="What&rsquo;s new"
        description="Track every feature, improvement, and fix. We ship in public."
      />

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {entries.map((entry, i) => (
            <div key={i} className="relative pl-8 pb-12 last:pb-0">
              {/* Timeline line */}
              <div className="absolute left-3 top-2 bottom-0 w-px bg-site-border" />
              {/* Timeline dot */}
              <div className="absolute left-1.5 top-2 w-3 h-3 rounded-full bg-site-accent border-2 border-site-bg" />

              <div className="mb-2 flex items-center gap-3">
                <time className="text-sm text-site-dim font-mono">{entry.date}</time>
                <span className="text-xs px-2 py-0.5 rounded-full border border-site-accent/30 text-site-accent bg-site-accent/5">
                  {entry.version}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-4">{entry.title}</h3>
              <ul className="space-y-2">
                {entry.changes.map((change, j) => (
                  <li key={j} className="flex gap-2 text-sm text-site-muted">
                    <span className="text-green-400 shrink-0 mt-0.5">+</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
