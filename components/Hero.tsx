'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function Hero() {
  const { t, lang } = useLang();

  return (
    <section className="relative bg-navy overflow-hidden">
      {/* Subtle brand glow accents */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Left — copy */}
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
              {t.heroBadge}
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-[1.05] tracking-tightest mb-5">
              {t.heroTitle}
            </h1>

            <p className="text-white/70 text-lg mb-8 max-w-md leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/collections/womens-clothing"
                className="group inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-xl shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-premium"
                style={{ backgroundImage: 'linear-gradient(135deg, #FF7A2E 0%, #FF6B1A 55%, #f15e10 100%)' }}
              >
                {t.shopNow}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/collections/consumer-electronics"
                className="inline-flex items-center gap-2 border-2 border-white/25 hover:border-white hover:bg-white/5 text-white font-semibold px-7 py-3.5 rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-premium"
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
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 ease-premium">
                <div className="w-11 h-11 rounded-xl bg-brand-orange/20 flex items-center justify-center flex-shrink-0">
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
