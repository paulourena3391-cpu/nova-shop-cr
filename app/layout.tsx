import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ToastProvider } from '@/context/ToastContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import PageProgressWrapper from '@/components/PageProgressWrapper';
import SocialProof from '@/components/SocialProof';
import ScrollReveal from '@/components/ScrollReveal';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: {
    default: 'Nova Shop — Premium Online Store',
    template: '%s | Nova Shop',
  },
  description:
    'Nova Shop — Premium products in tech, fashion, home, beauty and more. Fast US shipping & secure payments.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nova-shop-cr.vercel.app'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Nova Shop',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>

              {/* Floating buttons */}
              <ScrollToTop />

              {/* CRO: social proof + scroll reveal */}
              <SocialProof />
              <ScrollReveal />

              {/* Real visitor tracking */}
              <Analytics />
            </ToastProvider>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
