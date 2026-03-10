import Nav from '../../components/website/Nav';
import Footer from '../../components/website/Footer';

export default function WebsiteLayout({ children }) {
  return (
    <div className="bg-site-bg text-site-text min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="site-rainbow-bg" aria-hidden="true" />
      <Nav />
      <main className="flex-1 pt-14">
        {children}
      </main>
      <Footer />
    </div>
  );
}
