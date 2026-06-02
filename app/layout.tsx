import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Nova Shop CR — Premium Online Store',
    template: '%s | Nova Shop CR',
  },
  description:
    'Nova Shop CR — Tu tienda online de productos premium en Costa Rica. Electrónica, belleza, hogar, deportes y más.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://novashop.cr'
  ),
  openGraph: {
    type: 'website',
    locale: 'es_CR',
    alternateLocale: 'en_US',
    siteName: 'Nova Shop CR',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Preconnect to Shopify CDN for faster image loading */}
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
      </head>
      <body>
        <LanguageProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <AnnouncementBar />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
