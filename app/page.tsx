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
  title: 'Nova Shop CR — Tienda Online Premium',
  description: 'Los mejores productos en electrónica, moda, hogar y deportes. Envíos rápidos y pagos seguros en Costa Rica.',
};

// Always render fresh so newly imported products appear immediately
export const dynamic = 'force-dynamic';

// Collections to feature — only show ones with products
const FEATURED_CATEGORIES = [
  { handle: 'womens-clothing',      titleEs: 'Ropa de Mujer',     titleEn: "Women's Clothing"  },
  { handle: 'consumer-electronics', titleEs: 'Electrónica',       titleEn: 'Electronics'       },
  { handle: 'hombre',               titleEs: 'Ropa de Hombre',    titleEn: "Men's Clothing"    },
  { handle: 'calzado-de-mujer',     titleEs: 'Calzado de Mujer',  titleEn: "Women's Footwear"  },
  { handle: 'fitness',              titleEs: 'Fitness y Deporte', titleEn: 'Fitness & Sports'  },
  { handle: 'decoracion',           titleEs: 'Hogar y Deco',      titleEn: 'Home & Decor'      },
  { handle: 'ninos',                titleEs: 'Niños',             titleEn: 'Boys'              },
  { handle: 'ninas',                titleEs: 'Niñas',             titleEn: 'Girls'             },
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

async function BestSellersGrid() {
  const { products } = await getProducts({ first: 4, sortKey: 'BEST_SELLING' });
  if (!products.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}

async function DealsGrid() {
  const { products } = await getProducts({ first: 4, sortKey: 'CREATED_AT', reverse: true });
  if (!products.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function HomePage() {
  return (
    <>
      {/* Hero */}
      <Hero />

      {/* Trust strip */}
      <TrustBadges />

      {/* ── Amazon-style category cards grid ── */}
      <section className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_CATEGORIES.map((cat) => (
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
                />
              </Suspense>
            ))}
          </div>
        </div>
      </section>

      {/* ── Deals of the day ── */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b-2 border-gray-200">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-navy">Ofertas del día</h2>
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded">OFERTA</span>
            </div>
            <CountdownTimer />
          </div>
          <Suspense fallback={<ProductsSkeleton count={4} />}>
            <DealsGrid />
          </Suspense>
        </div>
      </section>

      {/* ── Best sellers ── */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6 pb-3 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-navy">Los más vendidos</h2>
            <Link
              href="/collections/womens-clothing"
              className="text-blue-600 hover:text-brand-orange text-sm font-medium transition-colors"
            >
              Ver todo →
            </Link>
          </div>
          <Suspense fallback={<ProductsSkeleton count={4} />}>
            <BestSellersGrid />
          </Suspense>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </>
  );
}
