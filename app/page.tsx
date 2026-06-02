import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getProducts } from '@/lib/shopify';
import Hero from '@/components/Hero';
import TrustBadges from '@/components/TrustBadges';
import CategoryGrid from '@/components/CategoryGrid';
import CountdownTimer from '@/components/CountdownTimer';
import ProductCard from '@/components/ProductCard';
import Newsletter from '@/components/Newsletter';

export const metadata: Metadata = {
  title: 'Nova Shop CR — Tienda Online Premium',
  description:
    'Descubrí los mejores productos en electrónica, belleza, hogar y deportes. Envíos rápidos y pagos seguros en Costa Rica.',
};

// Products section skeleton
function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-4/5" />
            <div className="h-4 bg-gray-100 rounded w-2/5" />
            <div className="h-9 bg-gray-100 rounded mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function BestSellersGrid() {
  const { products } = await getProducts({ first: 8, sortKey: 'BEST_SELLING' });

  if (!products.length) {
    return (
      <p className="text-gray-400 text-center py-12">
        No products found. Connect your Shopify store to display products.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}

async function DealsGrid() {
  const { products } = await getProducts({ first: 4, sortKey: 'BEST_SELLING', reverse: true });
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
      {/* 1. Hero */}
      <Hero />

      {/* 2. Trust badges strip */}
      <TrustBadges />

      {/* 3. Category grid */}
      <CategoryGrid />

      {/* 4. Deals of the day */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="badge-orange mb-2">🔥 HOT</span>
              <h2 className="section-title">Ofertas del día</h2>
            </div>
            <CountdownTimer />
          </div>

          <Suspense fallback={<ProductsSkeleton />}>
            <DealsGrid />
          </Suspense>
        </div>
      </section>

      {/* 5. Best sellers */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Más vendidos</h2>
              <p className="section-subtitle">Lo que todos están comprando</p>
            </div>
            <Link
              href="/collections/all"
              className="text-brand-orange hover:text-brand-orange-hover font-semibold text-sm transition-colors"
            >
              Ver todo →
            </Link>
          </div>

          <Suspense fallback={<ProductsSkeleton />}>
            <BestSellersGrid />
          </Suspense>
        </div>
      </section>

      {/* 6. Newsletter */}
      <Newsletter />
    </>
  );
}
