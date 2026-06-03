'use client';

import { Star, BadgeCheck, ThumbsUp } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

type Review = {
  name: string;
  country: string;
  rating: number;
  daysAgo: number;
  es: string;
  en: string;
  likes: number;
};

const REVIEWS: Review[] = [
  { name: 'María José R.', country: '🇨🇷', rating: 5, daysAgo: 3,  likes: 24,
    es: 'Mae llegó antes de lo que pensaba y la calidad está brutal. Ya pedí otro para regalar 🙌',
    en: 'Arrived faster than expected and the quality is amazing. Already ordered another one as a gift 🙌' },
  { name: 'Jessica M.',   country: '🇺🇸', rating: 5, daysAgo: 6,  likes: 41,
    es: 'Lo pedí sin fe y resultó buenísimo. 100% recomendado, vale cada centavo.',
    en: 'Ordered it with zero faith and it turned out amazing. 100% recommend, worth every penny.' },
  { name: 'Carlos V.',    country: '🇨🇷', rating: 5, daysAgo: 8,  likes: 17,
    es: 'Excelente atención y el producto tal cual las fotos. El envío llegó en 9 días.',
    en: 'Great service and the product is exactly like the photos. Shipping took 9 days.' },
  { name: 'Ashley T.',    country: '🇺🇸', rating: 4, daysAgo: 12, likes: 9,
    es: 'Muy bueno por el precio. Le doy 4 estrellas solo porque tardó un poquito el envío.',
    en: 'Really good for the price. 4 stars only because shipping took a bit.' },
  { name: 'Daniela S.',   country: '🇨🇷', rating: 5, daysAgo: 15, likes: 33,
    es: 'Me arrepiento de no haberlo comprado antes. Lo uso todos los días 😍',
    en: "I regret not buying it sooner. I use it every single day 😍" },
];

export default function ProductReviews() {
  const { lang } = useLang();
  const es = lang === 'es';

  const total = 247;
  const avg = 4.8;
  const dist = [
    { stars: 5, pct: 86 },
    { stars: 4, pct: 10 },
    { stars: 3, pct: 3 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 0 },
  ];

  const ago = (d: number) =>
    es ? `hace ${d} días` : `${d} days ago`;

  return (
    <section className="mt-12 md:mt-16 px-4 md:px-0">
      <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tightest mb-6 inline-flex items-center gap-3">
        <span className="w-1.5 h-7 bg-brand-orange rounded-full" />
        {es ? 'Lo que dicen nuestros clientes' : 'What our customers say'}
      </h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
        <div className="text-center sm:border-r sm:border-gray-200 sm:pr-10">
          <div className="text-5xl font-extrabold text-navy">{avg}</div>
          <div className="flex justify-center gap-0.5 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {total} {es ? 'reseñas' : 'reviews'}
          </p>
        </div>
        <div className="flex-1 space-y-1.5">
          {dist.map((d) => (
            <div key={d.stars} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-3">{d.stars}</span>
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-9 text-right">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {REVIEWS.map((r) => (
          <div key={r.name} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange-light flex items-center justify-center font-bold text-brand-orange">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm flex items-center gap-1.5">
                    {r.name} <span>{r.country}</span>
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <BadgeCheck size={12} /> {es ? 'Compra verificada' : 'Verified purchase'}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{ago(r.daysAgo)}</span>
            </div>

            <div className="flex gap-0.5 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14}
                  className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
              ))}
            </div>

            <p className="text-gray-600 text-sm mt-2.5 leading-relaxed">{es ? r.es : r.en}</p>

            <button className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-orange mt-3 transition-colors">
              <ThumbsUp size={13} /> {es ? 'Útil' : 'Helpful'} ({r.likes})
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
