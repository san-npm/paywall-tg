import { notFound } from 'next/navigation';
import HomePageClient from '../../../components/website/HomePageClient';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import { messages } from '@/lib/i18n';

const SUPPORTED_LANGS = ['es', 'ru', 'pt', 'id', 'ar', 'hi', 'tr', 'fa', 'uk'];

const langMeta = {
  es: { title: 'Telegram Paywall para Monetización de Comunidades', description: 'Lanza un paywall de Telegram para monetizar el acceso a comunidades, contenido de pago y productos digitales con checkout de Telegram Stars.', htmlLang: 'es' },
  ru: { title: 'Telegram Paywall для Монетизации Сообществ', description: 'Запустите Telegram Paywall для монетизации доступа к сообществам, платного контента и цифровых продуктов с оплатой через Telegram Stars.', htmlLang: 'ru' },
  pt: { title: 'Telegram Paywall para Monetização de Comunidades', description: 'Lance um paywall no Telegram para monetizar acesso a comunidades, conteúdo pago e produtos digitais com checkout via Telegram Stars.', htmlLang: 'pt' },
  id: { title: 'Telegram Paywall untuk Monetisasi Komunitas', description: 'Luncurkan paywall Telegram untuk monetisasi akses komunitas, konten berbayar, dan produk digital dengan checkout Telegram Stars.', htmlLang: 'id' },
  ar: { title: 'بوابة دفع تيليجرام لتحقيق الدخل من المجتمعات', description: 'أطلق بوابة دفع تيليجرام لتحقيق الدخل من الوصول إلى المجتمعات والمحتوى المدفوع والمنتجات الرقمية باستخدام Telegram Stars.', htmlLang: 'ar' },
  hi: { title: 'Telegram Paywall कम्युनिटी मोनेटाइज़ेशन के लिए', description: 'Telegram Stars चेकआउट के साथ कम्युनिटी एक्सेस, पेड कंटेंट और डिजिटल प्रोडक्ट्स को मोनेटाइज़ करने के लिए Telegram Paywall लॉन्च करें।', htmlLang: 'hi' },
  tr: { title: 'Topluluk Monetizasyonu için Telegram Paywall', description: 'Telegram Stars ödeme sistemiyle topluluk erişimi, ücretli içerik ve dijital ürünleri monetize etmek için Telegram Paywall kurun.', htmlLang: 'tr' },
  fa: { title: 'پی‌وال تلگرام برای کسب درآمد از جوامع', description: 'با استفاده از پرداخت Telegram Stars، دسترسی به جامعه، محتوای پولی و محصولات دیجیتال را درآمدزا کنید.', htmlLang: 'fa' },
  uk: { title: 'Telegram Paywall для Монетизації Спільнот', description: 'Запустіть Telegram Paywall для монетизації доступу до спільнот, платного контенту та цифрових продуктів з оплатою через Telegram Stars.', htmlLang: 'uk' },
};

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!SUPPORTED_LANGS.includes(lang)) return {};

  const meta = langMeta[lang];
  const allLangs = ['en', ...SUPPORTED_LANGS];
  const alternates = {
    canonical: `${SITE_URL}/${lang}`,
    languages: {},
  };
  alternates.languages['en'] = SITE_URL;
  for (const l of SUPPORTED_LANGS) {
    alternates.languages[l] = `${SITE_URL}/${l}`;
  }
  alternates.languages['x-default'] = SITE_URL;

  return {
    title: meta.title,
    description: meta.description,
    alternates,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/${lang}`,
      siteName: 'Gategram',
      type: 'website',
      locale: meta.htmlLang,
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Gategram' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [`${SITE_URL}/og-image.png`],
    },
    other: {
      'content-language': meta.htmlLang,
    },
  };
}

export default async function LangHomePage({ params }) {
  const { lang } = await params;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  const t = messages[lang] || messages.en;
  const meta = langMeta[lang];

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Gategram',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Telegram Mini App',
    description: meta.description,
    inLanguage: meta.htmlLang,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free to start, platform fee on successful sales',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <HomePageClient forceLang={lang} />
    </>
  );
}
