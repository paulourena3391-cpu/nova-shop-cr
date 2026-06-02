'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

// Heading — shown above the 2×2 image grid
export function CategoryCardTitle({
  handle,
  titleEs,
  titleEn,
}: {
  handle: string;
  titleEs: string;
  titleEn: string;
}) {
  const { lang } = useLang();
  return (
    <Link href={`/collections/${handle}`}>
      <h3 className="font-bold text-navy text-lg mb-3 hover:text-brand-orange transition-colors">
        {lang === 'es' ? titleEs : titleEn}
      </h3>
    </Link>
  );
}

// "Comprar ahora / Shop now" link — shown below the image grid
export function CategoryShopNow({ handle }: { handle: string }) {
  const { t } = useLang();
  return (
    <Link
      href={`/collections/${handle}`}
      className="text-sm text-blue-600 hover:text-brand-orange font-medium transition-colors"
    >
      {t.shopNow} →
    </Link>
  );
}
