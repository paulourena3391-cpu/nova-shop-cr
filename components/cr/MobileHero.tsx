import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Banner compacto para móvil (estilo marketplace). El hero premium grande
// queda solo en escritorio. Objetivo: máxima densidad, productos visibles sin scroll.
export default function MobileHero() {
  return (
    <section className="md:hidden px-3 pt-3">
      <Link
        href="/cr/collections/cr-ofertas"
        className="relative block overflow-hidden rounded-2xl bg-navy text-white active:scale-[0.99] transition-transform"
        style={{ backgroundImage: 'linear-gradient(120deg, #0b1a33 0%, #13294d 60%, #1c3a66 100%)' }}
      >
        {/* glow */}
        <span className="pointer-events-none absolute -top-10 -right-6 h-32 w-32 rounded-full bg-brand-orange/30 blur-2xl" />
        <div className="relative flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-orange">
              🔥 Promo del mes
            </span>
            <h2 className="mt-1.5 text-xl font-extrabold leading-tight">
              Hasta <span className="text-brand-orange">60%</span> de descuento
            </h2>
            <p className="text-[11px] text-white/60 leading-snug mt-0.5">
              Envío desde bodega local · Precios en colones · Sin aduanas
            </p>
          </div>
          <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-xl bg-brand-orange px-3 py-2 text-sm font-bold shadow-cta">
            Ver <ArrowRight size={15} />
          </span>
        </div>
      </Link>
    </section>
  );
}
