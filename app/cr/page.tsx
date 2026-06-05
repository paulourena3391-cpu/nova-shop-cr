import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getProducts } from '@/lib/shopify';
import Hero from '@/components/Hero';
import TrustBadges from '@/components/TrustBadges';
import CountdownTimer from '@/components/CountdownTimer';
import ProductCard from '@/components/ProductCard';
import Newsletter from '@/components/Newsletter';
import CategoryCard from '@/components/CategoryCard';

export const metadata: Metadata = {
  title: 'Inicio',
  description:
    'Nova Shop CR — Compra en línea con envío rápido en Costa Rica. Productos de Dropi directo a tu puerta.',
};

export const dynamic = 'force-dynamic';

const CR_BASE = '/cr';

// CR market categories — all use cr- prefixed Shopify collection handles
const CR_CATEGORIES = [
  { handle: 'cr-tecnologia',   titleEs: 'Tecnología',        titleEn: 'Tech'           },
  { handle: 'cr-belleza',      titleEs: 'Belleza',           titleEn: 'Beauty'         },
  { handle: 'cr-moda-mujer',   titleEs: 'Moda Mujer',        titleEn: "Women's Fashion" },
  { handle: 'cr-moda-hombre',  titleEs: 'Moda Hombre',       titleEn: "Men's Fashion"  },
  { handle: 'cr-calzado',      titleEs: 'Calzado',           titleEn: 'Footwear'       },
  { handle: 'cr-hogar',        titleEs: 'Hogar',             titleEn: 'Home'           },
  { handle: 'cr-deportes',     titleEs: 'Deportes',          titleEn: 'Sports'         },
  { handle: 'cr-mascotas',     titleEs: 'Mascotas',          titleEn: 'Pets'           },
];

function ProductsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-4/5" />
            <div className="h-9 bg-gray-100 rounded mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function CRBestSellersGrid() {
  const { products } = await getProducts({
    first: 4,
    sortKey: 'BEST_SELLING',
    query: 'vendor:Dropi',
  });
  if (!products.length) return <CRComingSoon />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} basePath={CR_BASE} />
      ))}
    </div>
  );
}

async function CRDealsGrid() {
  const { products } = await getProducts({
    first: 4,
    sortKey: 'CREATED_AT',
    reverse: true,
    query: 'vendor:Dropi',
  });
  if (!products.length) return <CRComingSoon />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} basePath={CR_BASE} />
      ))}
    </div>
  );
}

function CRComingSoon() {
  return (
    <div className="col-span-4 text-center py-14 text-gray-400">
      <p className="text-4xl mb-3">🛍️</p>
      <p className="text-lg font-semibold text-navy">Productos en camino</p>
      <p className="text-sm mt-1">Estamos cargando el catálogo de Dropi. ¡Volvé pronto!</p>
    </div>
  );
}

export default async function CRHomePage() {
  return (
    <>
      {/* Hero — same component, shows Spanish via LanguageContext */}
      <Hero />

      {/* Trust strip */}
      <TrustBadges />

      {/* ── Category cards grid ── */}
      <section className="bg-gray-100 py-8 reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CR_CATEGORIES.map((cat) => (
              <Suspense
                key={cat.handle}
                fallback={
                  <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse h-64" />
                }
              >
                <CategoryCard
                  handle={cat.handle}
                  titleEs={cat.titleEs}
                  titleEn={cat.titleEn}
                  basePath={CR_BASE}
                />
              </Suspense>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ofertas del día ── */}
      <section className="py-10 bg-white reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-7 bg-brand-orange rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tightest">
                Ofertas del día
              </h2>
              <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide shadow-sm animate-pulse">
                OFERTA
              </span>
            </div>
            <CountdownTimer />
          </div>
          <Suspense fallback={<ProductsSkeleton count={4} />}>
            <CRDealsGrid />
          </Suspense>
        </div>
      </section>

      {/* ── Más vendidos ── */}
      <section className="py-10 bg-gray-50 reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tightest inline-flex items-center gap-3">
              <span className="w-1.5 h-7 bg-brand-orange rounded-full" />
              Los más vendidos
            </h2>
            <Link
              href="/cr/collections/cr-tecnologia"
              className="group text-brand-orange hover:text-brand-orange-hover text-sm font-semibold transition-colors inline-flex items-center gap-1"
            >
              Ver todo{' '}
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </div>
          <Suspense fallback={<ProductsSkeleton count={4} />}>
            <CRBestSellersGrid />
          </Suspense>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </>
  );
}
