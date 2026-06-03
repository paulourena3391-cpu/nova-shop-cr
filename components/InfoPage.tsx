'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

type Props = {
  titleEs: string;
  titleEn: string;
  subtitleEs?: string;
  subtitleEn?: string;
  children: React.ReactNode;
};

/** Shared layout for all static info pages — consistent, animated, bilingual breadcrumb. */
export default function InfoPage({ titleEs, titleEn, subtitleEs, subtitleEn, children }: Props) {
  const { lang, t } = useLang();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6 animate-slide-up">
        <Link href="/" className="hover:text-brand-orange transition-colors">{t.home}</Link>
        <ChevronRight size={14} />
        <span className="text-navy font-medium">{lang === 'es' ? titleEs : titleEn}</span>
      </nav>

      {/* Header */}
      <header className="mb-10 animate-slide-up">
        <h1 className="font-display text-3xl md:text-5xl text-navy leading-tight">
          {lang === 'es' ? titleEs : titleEn}
        </h1>
        {(subtitleEs || subtitleEn) && (
          <p className="text-gray-500 text-lg mt-3 max-w-2xl">
            {lang === 'es' ? subtitleEs : subtitleEn}
          </p>
        )}
        <div className="h-1 w-20 bg-brand-orange rounded-full mt-5" />
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed animate-slide-up [&_h2]:font-display [&_h2]:text-navy [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-3 [&_a]:text-brand-orange [&_strong]:text-navy">
        {children}
      </div>
    </div>
  );
}
