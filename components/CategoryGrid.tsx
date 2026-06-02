'use client';

import Link from 'next/link';
import {
  Shirt, Laptop, Footprints, Dumbbell, Baby,
  Waves, Bike, TreePine, Sofa, UtensilsCrossed,
  Bath, FlowerIcon, Headphones, Tablet, Cpu, Watch
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

type Category = {
  handle: string;
  labelEs: string;
  labelEn: string;
  Icon: React.ElementType;
};

const CATEGORIES: Category[] = [
  { handle: 'womens-clothing',        labelEs: 'Ropa Mujer',     labelEn: "Women's",       Icon: Shirt },
  { handle: 'consumer-electronics',   labelEs: 'Electrónica',    labelEn: 'Electronics',   Icon: Laptop },
  { handle: 'hombre',                 labelEs: 'Hombre',         labelEn: 'Men',            Icon: Watch },
  { handle: 'calzado',                labelEs: 'Calzado',        labelEn: 'Footwear',       Icon: Footprints },
  { handle: 'ninos',                  labelEs: 'Niños',          labelEn: 'Kids',           Icon: Baby },
  { handle: 'fitness',                labelEs: 'Fitness',        labelEn: 'Fitness',        Icon: Dumbbell },
  { handle: 'natacion',               labelEs: 'Natación',       labelEn: 'Swimming',       Icon: Waves },
  { handle: 'ciclismo',               labelEs: 'Ciclismo',       labelEn: 'Cycling',        Icon: Bike },
  { handle: 'outdoor',                labelEs: 'Outdoor',        labelEn: 'Outdoor',        Icon: TreePine },
  { handle: 'decoracion',             labelEs: 'Decoración',     labelEn: 'Decor',          Icon: Sofa },
  { handle: 'cocina',                 labelEs: 'Cocina',         labelEn: 'Kitchen',        Icon: UtensilsCrossed },
  { handle: 'bano',                   labelEs: 'Baño',           labelEn: 'Bathroom',       Icon: Bath },
  { handle: 'jardin',                 labelEs: 'Jardín',         labelEn: 'Garden',         Icon: FlowerIcon },
  { handle: 'audio',                  labelEs: 'Audio',          labelEn: 'Audio',          Icon: Headphones },
  { handle: 'tablets',                labelEs: 'Tablets',        labelEn: 'Tablets',        Icon: Tablet },
  { handle: 'laptops',                labelEs: 'Laptops',        labelEn: 'Laptops',        Icon: Cpu },
  { handle: 'woman-hats-caps',        labelEs: 'Gorras',         labelEn: 'Hats & Caps',    Icon: Shirt },
  { handle: 'accesorios-electronica', labelEs: 'Accesorios',     labelEn: 'Accessories',    Icon: Cpu },
];

export default function CategoryGrid() {
  const { lang, t } = useLang();

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-navy mb-6 border-b-2 border-brand-orange pb-2 inline-block">
          {t.shopByCategory}
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {CATEGORIES.map(({ handle, labelEs, labelEn, Icon }) => (
            <Link
              key={handle}
              href={`/collections/${handle}`}
              className="group flex flex-col items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-brand-orange hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-brand-orange-light flex items-center justify-center transition-colors">
                <Icon size={22} className="text-gray-500 group-hover:text-brand-orange transition-colors" />
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-brand-orange text-center leading-tight transition-colors">
                {lang === 'es' ? labelEs : labelEn}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
