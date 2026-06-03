'use client';

import Link from 'next/link';
import {
  Shirt, Footprints, Dumbbell, Baby, Sofa, UtensilsCrossed,
  Headphones, Smartphone, Sparkles, PawPrint
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

type Category = {
  handle: string;
  labelEs: string;
  labelEn: string;
  Icon: React.ElementType;
};

const CATEGORIES: Category[] = [
  { handle: 'womens-clothing',        labelEs: 'Ropa Mujer',     labelEn: "Women's",        Icon: Shirt },
  { handle: 'hombre',                 labelEs: 'Hombre',         labelEn: 'Men',            Icon: Shirt },
  { handle: 'consumer-electronics',   labelEs: 'Tecnología',     labelEn: 'Tech',           Icon: Smartphone },
  { handle: 'audio',                  labelEs: 'Audio',          labelEn: 'Audio',          Icon: Headphones },
  { handle: 'belleza-y-cuidado-personal', labelEs: 'Belleza',    labelEn: 'Beauty',         Icon: Sparkles },
  { handle: 'calzado-de-mujer',       labelEs: 'Calzado Mujer',  labelEn: "Women's Shoes",  Icon: Footprints },
  { handle: 'calzado-de-hombre',      labelEs: 'Calzado Hombre', labelEn: "Men's Shoes",    Icon: Footprints },
  { handle: 'fitness',                labelEs: 'Fitness',        labelEn: 'Fitness',        Icon: Dumbbell },
  { handle: 'decoracion',             labelEs: 'Hogar',          labelEn: 'Home',           Icon: Sofa },
  { handle: 'cocina',                 labelEs: 'Cocina',         labelEn: 'Kitchen',        Icon: UtensilsCrossed },
  { handle: 'ninas',                  labelEs: 'Niñas',          labelEn: 'Girls',          Icon: Sparkles },
  { handle: 'ninos',                  labelEs: 'Niños',          labelEn: 'Boys',           Icon: Baby },
  { handle: 'pets',                   labelEs: 'Mascotas',       labelEn: 'Pets',           Icon: PawPrint },
];

export default function CategoryGrid() {
  const { lang, t } = useLang();

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6 tracking-tightest inline-flex items-center gap-3">
          <span className="w-1.5 h-7 bg-brand-orange rounded-full" />
          {t.shopByCategory}
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {CATEGORIES.map(({ handle, labelEs, labelEn, Icon }) => (
            <Link
              key={handle}
              href={`/collections/${handle}`}
              className="group flex flex-col items-center gap-2 p-3.5 bg-white border border-gray-100 rounded-2xl shadow-soft hover:border-brand-orange/40 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ease-premium"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-brand-orange-light group-hover:scale-110 flex items-center justify-center transition-all duration-300 ease-premium">
                <Icon size={22} className="text-gray-500 group-hover:text-brand-orange transition-colors" />
              </div>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-brand-orange text-center leading-tight transition-colors">
                {lang === 'es' ? labelEs : labelEn}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
