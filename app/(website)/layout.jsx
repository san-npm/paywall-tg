import Nav from '../../components/website/Nav';
import Footer from '../../components/website/Footer';
import GlobalEmojiBackground from '../../components/website/GlobalEmojiBackground';
import AnalyticsConsent from '@/components/AnalyticsConsent';
import { SITE_URL, jsonLd } from '@/lib/seo';

const GA_MEASUREMENT_ID_RAW = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
const GA_MEASUREMENT_ID = /^G-[A-Z0-9]{6,12}$/.test(GA_MEASUREMENT_ID_RAW) ? GA_MEASUREMENT_ID_RAW : null;

export default function WebsiteLayout({ children }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Gategram',
    legalName: 'COMMIT MEDIA SARL',
    url: SITE_URL,
    logo: `${SITE_URL}/Gategram-icon.png`,
    sameAs: ['https://t.me/gategramapp_bot', 'https://github.com/san-npm/paywall-tg', 'https://openletz.com'],
    description: 'Gategram is a Telegram Mini App that lets creators sell paid content, community access, and digital products using native Telegram Stars checkout.',
    foundingDate: '2026',
    foundingLocation: { '@type': 'Place', name: 'Luxembourg' },
    identifier: [
      { '@type': 'PropertyValue', propertyID: 'RCS Luxembourg', value: 'B276192' },
      { '@type': 'PropertyValue', propertyID: 'VAT', value: 'LU34811132' },
    ],
  };

  return (
    <div className="bg-site-bg text-site-text min-h-screen flex flex-col relative overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }} />
      <div className="site-rainbow-bg" aria-hidden="true" />
      <GlobalEmojiBackground />
      <div className="relative z-10">
        <Nav />
        <main className="flex-1 pt-14">
          {children}
        </main>
        <Footer />
      </div>
      <AnalyticsConsent measurementId={GA_MEASUREMENT_ID} />
    </div>
  );
}
