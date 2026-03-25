import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Blog — Telegram Monetization Guides',
  description: 'Guides and tutorials on monetizing Telegram channels, selling digital content with Stars, and building paid communities.',
  path: '/blog',
  keywords: ['telegram monetization blog', 'telegram stars guide', 'sell on telegram'],
});

const posts = [
  {
    slug: 'how-to-sell-digital-content-on-telegram',
    title: 'How to Sell Digital Content on Telegram in 2026 (Step-by-Step)',
    description: 'Complete guide to selling guides, courses, and exclusive content to your Telegram audience using Stars payments.',
    date: '2026-03-25',
    readTime: '8 min',
  },
  {
    slug: 'telegram-stars-payments-guide',
    title: 'Telegram Stars Payments: Everything Creators Need to Know',
    description: 'What are Telegram Stars, how do payments work, and how creators can withdraw earnings. The complete breakdown.',
    date: '2026-03-25',
    readTime: '6 min',
  },
  {
    slug: 'telegram-paywall-vs-gumroad',
    title: 'Telegram Paywall vs Gumroad: Which Is Better for Digital Creators?',
    description: 'Side-by-side comparison of selling digital products on Telegram versus Gumroad. Fees, conversion rates, and setup time.',
    date: '2026-03-25',
    readTime: '7 min',
  },
];

export default function BlogIndex() {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Gategram Blog',
    description: 'Guides on Telegram monetization, Stars payments, and selling digital content.',
    url: 'https://www.gategram.app/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Gategram',
      url: 'https://www.gategram.app',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-site-muted mb-12">Guides on Telegram monetization, Stars payments, and selling digital content.</p>
        <div className="space-y-10">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-site-border pb-8">
              <Link href={`/blog/${post.slug}`} className="group">
                <h2 className="text-2xl font-semibold group-hover:text-site-accent transition-colors">{post.title}</h2>
                <p className="text-site-muted mt-2">{post.description}</p>
                <div className="flex gap-4 mt-3 text-sm text-site-muted">
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                  <span>{post.readTime} read</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
