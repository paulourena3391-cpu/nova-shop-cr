import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ToastProvider } from '@/context/ToastContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import PageProgressWrapper from '@/components/PageProgressWrapper';
import SocialProof from '@/components/SocialProof';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata: Metadata = {
  title: {
    default: 'Nova Shop CR — Premium Online Store',
    template: '%s | Nova Shop CR',
  },
  description:
    'Nova Shop CR — Tu tienda online de productos premium en Costa Rica. Electrónica, moda, hogar, deportes y más.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nova-shop-cr.vercel.app'
  ),
  openGraph: {
    type: 'website',
    locale: 'es_CR',
    alternateLocale: 'en_US',
    siteName: 'Nova Shop CR',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
      </head>
      <body>
        <LanguageProvider>
          <CartProvider>
            <ToastProvider>
              {/* Navigation progress bar */}
              <PageProgressWrapper />

              <div className="flex flex-col min-h-screen">
                <AnnouncementBar />
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>

              {/* Floating buttons */}
              <ScrollToTop />

              {/* CRO: recent-purchase social proof + scroll reveal animations */}
              <SocialProof />
              <ScrollReveal />
            </ToastProvider>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
