'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function Hero() {
  const { t, lang } = useLang();

  return (
    <section className="bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Left — copy */}
          <div>
            <span className="inline-block bg-brand-orange text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-5">
              {t.heroBadge}
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-5">
              {t.heroTitle}
            </h1>

            <p className="text-white/70 text-lg mb-8 max-w-md leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/collections/womens-clothing"
                className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold px-7 py-3.5 rounded-lg transition-colors"
              >
                {t.shopNow}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/collections/consumer-electronics"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white text-white font-semibold px-7 py-3.5 rounded-lg transition-colors"
              >
                {lang === 'es' ? 'Ver Electrónica' : 'View Electronics'}
              </Link>
            </div>
          </div>

          {/* Right — trust stats */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { Icon: Truck,        title: lang === 'es' ? 'Envío Rápido'     : 'Fast Shipping',    desc: lang === 'es' ? 'Entrega en 2-3 días' : '2-3 day delivery' },
              { Icon: ShieldCheck,  title: lang === 'es' ? 'Pago Seguro'      : 'Secure Payment',   desc: lang === 'es' ? 'SSL 256 bits'        : '256-bit SSL' },
              { Icon: RotateCcw,    title: lang === 'es' ? 'Devoluciones'     : 'Easy Returns',     desc: lang === 'es' ? '30 días sin problema' : '30-day hassle-free' },
              { Icon: Headphones,   title: lang === 'es' ? 'Soporte 24/7'     : '24/7 Support',     desc: lang === 'es' ? 'Siempre disponibles' : 'Always available' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-orange/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-brand-orange" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
