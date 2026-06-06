'use client';

import { Check, X } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';

const ROWS = [
  { es: 'Precio justo',                en: 'Fair price',              nova: true,  others: false },
  { es: 'Envío rápido desde USA',      en: 'Fast US shipping',        nova: true,  others: false },
  { es: 'Garantía de 30 días',         en: '30-day guarantee',        nova: true,  others: false },
  { es: 'Calidad verificada',          en: 'Verified quality',        nova: true,  others: false },
  { es: 'Soporte en español',          en: 'Spanish support',         nova: true,  others: false },
  { es: 'Pago 100% seguro',            en: '100% secure checkout',    nova: true,  others: true  },
];

export default function ProductComparison() {
  const { lang } = useLang();
  const { isCR } = useMarket();
  const es = lang === 'es';

  // CR: local shipping + SINPE row (vs "other stores" that ship from abroad).
  const shippingFixed = ROWS.map((r) =>
    r.en === 'Fast US shipping' && isCR
      ? { ...r, es: 'Envío a todo Costa Rica', en: 'Nationwide CR shipping', nova: true, others: false }
      : r,
  );
  const rows = isCR
    ? [
        ...shippingFixed.slice(0, 2),
        { es: 'Pago con SINPE Móvil', en: 'SINPE Móvil payment', nova: true, others: false },
        ...shippingFixed.slice(2),
      ]
    : shippingFixed;

  return (
    <section className="mt-12 md:mt-16 px-4 md:px-0">
      <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tightest mb-6 inline-flex items-center gap-3">
        <span className="w-1.5 h-7 bg-brand-orange rounded-full" />
        {es ? '¿Por qué elegir Nova Shop?' : 'Why choose Nova Shop?'}
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left font-semibold text-gray-500 px-4 py-4">
                {es ? 'Característica' : 'Feature'}
              </th>
              <th className="px-4 py-4 text-center">
                <span className="font-display text-lg text-navy">
                  Nova<span className="text-brand-orange">Shop</span>
                </span>
              </th>
              <th className="px-4 py-4 text-center font-semibold text-gray-400">
                {es ? 'Otras tiendas' : 'Other stores'}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.en} className={i % 2 ? 'bg-gray-50/50' : 'bg-white'}>
                <td className="px-4 py-3.5 text-navy font-medium">{es ? r.es : r.en}</td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-center">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check size={16} className="text-emerald-600" strokeWidth={3} />
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-center">
                    {r.others ? (
                      <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check size={16} className="text-emerald-600" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                        <X size={16} className="text-red-400" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
