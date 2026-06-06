'use client';

import { Sparkles, Zap, HeartHandshake, PackageCheck, BadgeCheck, Headphones } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';

const BENEFITS = [
  { Icon: BadgeCheck,     es: 'Calidad premium',        en: 'Premium quality',     dEs: 'Materiales seleccionados que duran.',          dEn: 'Hand-picked materials that last.' },
  { Icon: Zap,            es: 'Resultados al instante', en: 'Instant results',     dEs: 'Notás la diferencia desde el primer uso.',     dEn: 'Feel the difference from day one.' },
  { Icon: PackageCheck,   es: 'Envío rápido USA',       en: 'Fast US shipping',    dEs: 'A tu puerta en 7-14 días.',                     dEn: 'At your door in 7-14 days.' },
  { Icon: HeartHandshake, es: 'Garantía 30 días',       en: '30-day guarantee',    dEs: 'Si no te encanta, te devolvemos tu dinero.',    dEn: "Don't love it? Full refund." },
  { Icon: Headphones,     es: 'Soporte real 24/7',      en: 'Real 24/7 support',   dEs: 'Te respondemos en menos de 24h.',               dEn: 'We reply within 24h.' },
  { Icon: Sparkles,       es: 'Miles de clientes felices', en: 'Thousands happy',  dEs: 'Unite a nuestra comunidad.',                    dEn: 'Join our community.' },
];

export default function ProductBenefits() {
  const { lang } = useLang();
  const { isCR } = useMarket();
  const es = lang === 'es';

  // CR market ships locally and fast — override the US shipping benefit.
  const benefits = BENEFITS.map((b) =>
    b.en === 'Fast US shipping' && isCR
      ? { ...b, es: 'Envío a todo Costa Rica', en: 'Nationwide CR shipping', dEs: 'A tu puerta en 1-3 días hábiles.', dEn: 'At your door in 1-3 business days.' }
      : b,
  );

  return (
    <section className="mt-12 md:mt-16 px-4 md:px-0">
      <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tightest mb-6 inline-flex items-center gap-3">
        <span className="w-1.5 h-7 bg-brand-orange rounded-full" />
        {es ? '¿Por qué te va a encantar?' : "Why you'll love it"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map(({ Icon, es: tEs, en, dEs, dEn }) => (
          <div
            key={en}
            className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ease-premium"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-orange-light flex items-center justify-center shrink-0">
              <Icon size={22} className="text-brand-orange" />
            </div>
            <div>
              <p className="font-semibold text-navy">{es ? tEs : en}</p>
              <p className="text-sm text-gray-500 mt-0.5 leading-snug">{es ? dEs : dEn}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
