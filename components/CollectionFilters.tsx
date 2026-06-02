'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

type Props = {
  currentSort: string;
  minPrice?: string;
  maxPrice?: string;
  productCount: number;
};

const SORT_OPTIONS = [
  { value: 'best_selling', labelEs: 'Más vendidos', labelEn: 'Best Selling' },
  { value: 'price_asc', labelEs: 'Precio: Menor a Mayor', labelEn: 'Price: Low to High' },
  { value: 'price_desc', labelEs: 'Precio: Mayor a Menor', labelEn: 'Price: High to Low' },
  { value: 'newest', labelEs: 'Más recientes', labelEn: 'Newest' },
  { value: 'title_asc', labelEs: 'Nombre A-Z', labelEn: 'Name A-Z' },
];

export default function CollectionFilters({ currentSort, minPrice, maxPrice, productCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, lang } = useLang();

  const [min, setMin] = useState(minPrice ?? '');
  const [max, setMax] = useState(maxPrice ?? '');

  const updateParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  function applyPriceFilter() {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set('min', min); else params.delete('min');
    if (max) params.set('max', max); else params.delete('max');
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    setMin('');
    setMax('');
    router.push(pathname);
  }

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-navy mb-3">
          <SlidersHorizontal size={16} />
          {t.sort}
        </h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam('sort', opt.value)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentSort === opt.value
                  ? 'bg-brand-orange-light text-brand-orange font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
              }`}
            >
              {lang === 'es' ? opt.labelEs : opt.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-navy mb-3">{lang === 'es' ? 'Rango de precio' : 'Price Range'}</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder={t.minPrice}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="input-field text-sm py-2"
            min={0}
          />
          <input
            type="number"
            placeholder={t.maxPrice}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="input-field text-sm py-2"
            min={0}
          />
          <button onClick={applyPriceFilter} className="btn-primary w-full py-2 text-sm">
            {t.applyFilters}
          </button>
          {(minPrice || maxPrice) && (
            <button onClick={clearFilters} className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors">
              {t.clearFilters}
            </button>
          )}
        </div>
      </div>

      {/* Rating filter (visual only — requires Shopify Reviews app) */}
      <div>
        <h3 className="font-semibold text-navy mb-3">{lang === 'es' ? 'Valoración' : 'Rating'}</h3>
        {[5, 4, 3].map((stars) => (
          <button key={stars} className="flex items-center gap-2 py-1.5 text-sm text-gray-600 hover:text-brand-orange transition-colors w-full">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < stars ? 'text-amber-400' : 'text-gray-200'}>★</span>
            ))}
            <span>& {lang === 'es' ? 'más' : 'up'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
