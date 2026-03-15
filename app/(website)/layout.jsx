import Nav from '../../components/website/Nav';
import Footer from '../../components/website/Footer';
import GlobalEmojiBackground from '../../components/website/GlobalEmojiBackground';
import { SITE_URL } from '@/lib/seo';

export default function WebsiteLayout({ children }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Gategram',
    url: SITE_URL,
    logo: `${SITE_URL}/Gategram-icon.png`,
    sameAs: ['https://t.me/gategram_bot'],
    description: 'Telegram paywall and community monetization platform with native Stars checkout.',
  };

  return (
    <div className="bg-site-bg text-site-text min-h-screen flex flex-col relative overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <div className="site-rainbow-bg" aria-hidden="true" />
      <GlobalEmojiBackground />
      <div className="relative z-10">
        <Nav />
        <main className="flex-1 pt-14">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
