import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Nova Shop CR — Tu Tienda Online en Costa Rica',
    template: '%s | Nova Shop CR',
  },
  description:
    'Los mejores productos con envío rápido en Costa Rica. Tecnología, moda, hogar, deportes y más — entregado por Dropi.',
  openGraph: {
    type: 'website',
    locale: 'es_CR',
    siteName: 'Nova Shop CR',
  },
};

export default function CRLayout({ children }: { children: React.ReactNode }) {
  // Language is forced to Spanish via LanguageContext (detects /cr prefix).
  // This layout only provides CR-specific metadata.
  return <>{children}</>;
}
