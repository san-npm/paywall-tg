import '../../globals.css';
import { notFound } from 'next/navigation';
import WebMcpTools from '@/components/WebMcpTools';
import WebsiteShell from '@/components/website/WebsiteShell';
import { siteMetadata } from '@/lib/site-metadata';

const SUPPORTED_LANGS = ['es', 'ru', 'pt', 'id', 'ar', 'hi', 'tr', 'fa', 'uk'];
const RTL_LANGS = new Set(['ar', 'fa']);

export const metadata = siteMetadata;

export default async function LocalizedWebsiteLayout({ children, params }) {
  const { lang } = await params;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  return (
    <html lang={lang} dir={RTL_LANGS.has(lang) ? 'rtl' : 'ltr'} className="dark">
      <body className="min-h-screen">
        <WebMcpTools />
        <WebsiteShell>{children}</WebsiteShell>
      </body>
    </html>
  );
}
