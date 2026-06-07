import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getProducts } from '@/lib/shopify';
import HeroCR from '@/components/cr/HeroCR';
import TrustBadges from '@/components/TrustBadges';
import CountdownTimer from '@/components/CountdownTimer';
import ProductCard from '@/components/ProductCard';
import Newsletter from '@/components/Newsletter';
import CategoryCard from '@/components/CategoryCard';
import StatsCounter from '@/components/cr/StatsCounter';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/Motion';

export const metadata: Metadata = {
  title: 'Inicio',
  description:
    'Nova Shop CR — Compra en línea con envío rápido en Costa Rica. Productos de Dropi directo a tu puerta.',
};

export const dynamic = 'force-dynamic';

const CR_BASE = '/cr';

// CR market categories
const CR_CATEGORIES = [
  { handle: 'cr-moda-mujer',  titleEs: 'Moda Mujer',   titleEn: "Women's Fashion", productQuery: "tag:market-cr product_type:Women's Clothing"  },
  { handle: 'cr-moda-hombre', titleEs: 'Moda Hombre',  titleEn: "Men's Fashion",   productQuery: "tag:market-cr product_type:Men's Clothing"    },
  { handle: 'cr-calzado',     titleEs: 'Calzado',      titleEn: 'Footwear',        productQuery: 'tag:market-cr product_type:Footwear'          },
  { handle: 'cr-hogar',       titleEs: 'Hogar',        titleEn: 'Home & Living',   productQuery: 'tag:market-cr product_type:Home & Living'     },
  { handle: 'cr-deportes',    titleEs: 'Fitness',      titleEn: 'Fitness',         productQuery: 'tag:market-cr product_type:Sports & Fitness'  },
  { handle: 'cr-tecnologia',  titleEs: 'Tecnología',   titleEn: 'Tech',            productQuery: 'tag:market-cr product_type:Electronics'       },
  { handle: 'cr-mascotas',    titleEs: 'Mascotas',     titleEn: 'Pets',            productQuery: 'tag:market-cr product_type:Pet Supplies'      },
  { handle: 'cr-swimwear',    titleEs: 'Trajes de Baño', titleEn: 'Swimwear',      productQuery: 'tag:market-cr product_type:Swimwear'          },
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
    query: 'tag:market-cr',
  });
  if (!products.length) return <CRComingSoon />;
  return (
    <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product, i) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} priority={i < 4} basePath={CR_BASE} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

async function CRDealsGrid() {
  const { products } = await getProducts({
    first: 4,
    sortKey: 'CREATED_AT',
    reverse: true,
    query: "tag:market-cr product_type:Women's Clothing",
  });
  if (!products.length) return <CRComingSoon />;
  return (
    <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} basePath={CR_BASE} />
        </StaggerItem>
      ))}
    </StaggerGroup>
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

function SectionHeading({ children, badge }: { children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <h2 className="inline-flex items-center gap-3 text-3xl md:text-4xl font-bold text-navy tracking-tightest">
      <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-orange to-amber-400" />
      {children}
      {badge}
    </h2>
  );
}

export default async function CRHomePage() {
  return (
    <>
      {/* Premium animated hero — CR only */}
      <HeroCR />

      {/* Trust strip */}
      <TrustBadges />

      {/* ── Category cards grid ── */}
      <section className="bg-gradient-to-b from-gray-100 to-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-9 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-orange mb-2">
              Explorá la tienda
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy tracking-tightest">
              Comprá por categoría
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Productos seleccionados con envío rápido en todo Costa Rica.
            </p>
          </Reveal>

          <StaggerGroup
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            stagger={0.08}
          >
            {CR_CATEGORIES.map((cat, i) => (
              <StaggerItem key={`${cat.handle}-${i}`}>
                <Suspense
                  fallback={
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse h-64" />
                  }
                >
                  <CategoryCard
                    handle={cat.handle}
                    titleEs={cat.titleEs}
                    titleEn={cat.titleEn}
                    basePath={CR_BASE}
                    productQuery={cat.productQuery}
                  />
                </Suspense>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── Ofertas del día ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-gray-200">
            <SectionHeading
              badge={
                <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide shadow-sm animate-pulse">
                  OFERTA
                </span>
              }
            >
              Ofertas del día
            </SectionHeading>
            <CountdownTimer />
          </Reveal>
          <Suspense fallback={<ProductsSkeleton count={4} />}>
            <CRDealsGrid />
          </Suspense>
        </div>
      </section>

      {/* ── Más vendidos ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex items-end justify-between mb-8 pb-5 border-b border-gray-200">
            <SectionHeading>Los más vendidos</SectionHeading>
            <Link
              href="/cr/collections/cr-tecnologia"
              className="group text-brand-orange hover:text-brand-orange-hover text-sm font-semibold transition-colors inline-flex items-center gap-1"
            >
              Ver todo{' '}
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </Reveal>
          <Suspense fallback={<ProductsSkeleton count={4} />}>
            <CRBestSellersGrid />
          </Suspense>
        </div>
      </section>

      {/* Premium animated stats — builds "established brand" trust */}
      <StatsCounter />

      {/* Newsletter */}
      <Reveal>
        <Newsletter />
      </Reveal>
    </>
  );
}
