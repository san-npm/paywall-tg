import Script from 'next/script';

export const metadata = {
  title: 'PayGate — Dashboard',
  description: 'Manage your digital products on Telegram.',
};

export default function MiniAppLayout({ children }) {
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      {children}
    </>
  );
}
