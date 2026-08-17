import Script from 'next/script';
import TelegramInitDataBridge from './TelegramInitDataBridge';
import '../globals.css';

export const metadata = {
  title: 'Gategram — Dashboard',
  description: 'Manage your digital products on Telegram.',
  alternates: {},
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function MiniAppLayout({ children }) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <body className="min-h-screen miniapp">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramInitDataBridge />
        {children}
      </body>
    </html>
  );
}
