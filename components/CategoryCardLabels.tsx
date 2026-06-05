'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

// Heading — shown above the 2×2 image grid
export function CategoryCardTitle({
  handle,
  titleEs,
  titleEn,
  basePath = '',
}: {
  handle: string;
  titleEs: string;
  titleEn: string;
  basePath?: string;
}) {
  const { lang } = useLang();
  return (
    <Link href={`${basePath}/collections/${handle}`}>
      <h3 className="font-bold text-navy text-lg mb-3 hover:text-brand-orange transition-colors">
        {lang === 'es' ? titleEs : titleEn}
      </h3>
    </Link>
  );
}

// "Comprar ahora / Shop now" link — shown below the image grid
export function CategoryShopNow({ handle, basePath = '' }: { handle: string; basePath?: string }) {
  const { t } = useLang();
  return (
    <Link
      href={`${basePath}/collections/${handle}`}
      className="text-sm text-blue-600 hover:text-brand-orange font-medium transition-colors"
    >
      {t.shopNow} →
    </Link>
  );
}
