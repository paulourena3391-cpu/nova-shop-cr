'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

type Category = {
  handle: string;
  labelEs: string;
  labelEn: string;
  emoji: string;
  gradient: string;
};

const CATEGORIES: Category[] = [
  { handle: 'womens-clothing',      labelEs: 'Ropa Mujer',    labelEn: "Women's",      emoji: '👗', gradient: 'from-pink-500 to-rose-400' },
  { handle: 'consumer-electronics', labelEs: 'Electrónica',   labelEn: 'Electronics',  emoji: '💻', gradient: 'from-blue-600 to-blue-400' },
  { handle: 'hombre',               labelEs: 'Hombre',        labelEn: 'Men',          emoji: '👔', gradient: 'from-slate-600 to-slate-400' },
  { handle: 'calzado',              labelEs: 'Calzado',       labelEn: 'Footwear',     emoji: '👟', gradient: 'from-amber-600 to-amber-400' },
  { handle: 'ninos',                labelEs: 'Niños',         labelEn: 'Kids',         emoji: '🧸', gradient: 'from-purple-500 to-violet-400' },
  { handle: 'fitness',              labelEs: 'Fitness',       labelEn: 'Fitness',      emoji: '💪', gradient: 'from-green-600 to-emerald-400' },
  { handle: 'natacion',             labelEs: 'Natación',      labelEn: 'Swimming',     emoji: '🏊', gradient: 'from-cyan-500 to-blue-400' },
  { handle: 'ciclismo',             labelEs: 'Ciclismo',      labelEn: 'Cycling',      emoji: '🚴', gradient: 'from-lime-500 to-green-400' },
  { handle: 'outdoor',              labelEs: 'Outdoor',       labelEn: 'Outdoor',      emoji: '⛺', gradient: 'from-teal-600 to-teal-400' },
  { handle: 'decoracion',           labelEs: 'Decoración',    labelEn: 'Decor',        emoji: '🛋️', gradient: 'from-orange-400 to-amber-300' },
  { handle: 'cocina',               labelEs: 'Cocina',        labelEn: 'Kitchen',      emoji: '🍳', gradient: 'from-red-500 to-orange-400' },
  { handle: 'bano',                 labelEs: 'Baño',          labelEn: 'Bathroom',     emoji: '🛁', gradient: 'from-sky-500 to-cyan-400' },
  { handle: 'jardin',               labelEs: 'Jardín',        labelEn: 'Garden',       emoji: '🌿', gradient: 'from-green-500 to-lime-400' },
  { handle: 'laptops',              labelEs: 'Laptops',       labelEn: 'Laptops',      emoji: '💻', gradient: 'from-indigo-600 to-blue-500' },
  { handle: 'tablets',              labelEs: 'Tablets',       labelEn: 'Tablets',      emoji: '📱', gradient: 'from-violet-600 to-purple-400' },
  { handle: 'audio',                labelEs: 'Audio',         labelEn: 'Audio',        emoji: '🎧', gradient: 'from-gray-700 to-gray-500' },
  { handle: 'woman-hats-caps',      labelEs: 'Gorras',        labelEn: 'Hats & Caps',  emoji: '🧢', gradient: 'from-rose-500 to-pink-400' },
  { handle: 'accesorios-electronica', labelEs: 'Accesorios',  labelEn: 'Accessories',  emoji: '🔌', gradient: 'from-blue-500 to-indigo-400' },
];

export default function CategoryGrid() {
  const { lang, t } = useLang();

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="section-title">{t.shopByCategory}</h2>
          <p className="section-subtitle mt-2">
            {lang === 'es' ? 'Explorá todas nuestras categorías' : 'Explore all our categories'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.handle}
              href={`/collections/${cat.handle}`}
              className="group relative rounded-xl overflow-hidden aspect-square flex flex-col items-center justify-center text-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
              />
              <div className="relative z-10 flex flex-col items-center gap-1.5 p-3 text-center">
                <span className="text-3xl">{cat.emoji}</span>
                <span className="font-semibold text-xs leading-tight">
                  {lang === 'es' ? cat.labelEs : cat.labelEn}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
