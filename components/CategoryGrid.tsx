'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/context/LanguageContext';

type Category = {
  handle: string;
  labelEs: string;
  labelEn: string;
  emoji: string;
  gradient: string;
};

const CATEGORIES: Category[] = [
  {
    handle: 'electronics',
    labelEs: 'Electrónica',
    labelEn: 'Electronics',
    emoji: '💻',
    gradient: 'from-blue-600 to-blue-400',
  },
  {
    handle: 'beauty',
    labelEs: 'Belleza',
    labelEn: 'Beauty',
    emoji: '💄',
    gradient: 'from-pink-500 to-rose-400',
  },
  {
    handle: 'home',
    labelEs: 'Hogar',
    labelEn: 'Home',
    emoji: '🏡',
    gradient: 'from-amber-500 to-yellow-400',
  },
  {
    handle: 'sports',
    labelEs: 'Deportes',
    labelEn: 'Sports',
    emoji: '⚽',
    gradient: 'from-green-600 to-emerald-400',
  },
  {
    handle: 'trending',
    labelEs: 'Tendencias',
    labelEn: 'Trending',
    emoji: '🔥',
    gradient: 'from-orange-500 to-brand-orange',
  },
];

export default function CategoryGrid() {
  const { lang, t } = useLang();

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="section-title">{t.shopByCategory}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.handle}
              href={`/collections/${cat.handle}`}
              className="group relative rounded-2xl overflow-hidden aspect-square flex flex-col items-center justify-center text-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />

              {/* Overlay pattern */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                }} />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center">
                <span className="text-4xl">{cat.emoji}</span>
                <span className="font-semibold text-sm md:text-base leading-tight">
                  {lang === 'es' ? cat.labelEs : cat.labelEn}
                </span>
              </div>

              {/* Arrow indicator */}
              <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
