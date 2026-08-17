import '../globals.css';
import WebMcpTools from '@/components/WebMcpTools';
import WebsiteShell from '@/components/website/WebsiteShell';
import { siteMetadata } from '@/lib/site-metadata';

export const metadata = siteMetadata;

export default function WebsiteLayout({ children }) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <body className="min-h-screen">
        <WebMcpTools />
        <WebsiteShell>{children}</WebsiteShell>
      </body>
    </html>
  );
}
