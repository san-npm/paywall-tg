import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'PayGate — Sell Digital Content on Telegram',
  description: 'Create paywalls, sell files, links, and content directly in Telegram with Stars payments.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
