import './globals.css';

export const metadata = {
  title: 'PayGate — Sell Digital Content on Telegram',
  description: 'Native Telegram checkout + instant delivery. Sell digital products, paid content, and files directly inside Telegram with Stars payments. 95/5 split.',
  openGraph: {
    title: 'PayGate — Sell Digital Content on Telegram',
    description: 'Native Telegram checkout + instant delivery. No external accounts, no friction. 95/5 revenue split.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
