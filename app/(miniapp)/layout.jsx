import Script from 'next/script';
import TelegramInitDataBridge from './TelegramInitDataBridge';

export const metadata = {
  title: 'Gategram — Dashboard',
  description: 'Manage your digital products on Telegram.',
};

export default function MiniAppLayout({ children }) {
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <Script id="miniapp-body-class" strategy="beforeInteractive">
        {`document.body.classList.add('miniapp');`}
      </Script>
      <TelegramInitDataBridge />
      {children}
    </>
  );
}
