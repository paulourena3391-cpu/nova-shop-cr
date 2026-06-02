// Server Component — data fetching, metadata, static params.
// CollectionFilters is a client component wrapped in Suspense (useSearchParams requirement).
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCollection, getCollections, CollectionSortKey, ShopifyProduct } from '@/lib/shopify';
import ProductCard from '@/components/ProductCard';
import CollectionFilters from '@/components/CollectionFilters';

type PageProps = {
  params: { handle: string };
  searchParams: { sort?: string; min?: string; max?: string };
};

export async function generateStaticParams() {
  const collections = await getCollections(20);
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const col = await getCollection({ handle: params.handle, first: 1 });
  if (!col) return {};
  return {
    title: col.title,
    description: col.description || `Shop ${col.title} at Nova Shop CR`,
  };
}

const SORT_OPTIONS: { value: string; sortKey: CollectionSortKey; reverse: boolean }[] = [
  { value: 'best_selling', sortKey: 'BEST_SELLING', reverse: false },
  { value: 'price_asc', sortKey: 'PRICE', reverse: false },
  { value: 'price_desc', sortKey: 'PRICE', reverse: true },
  { value: 'newest', sortKey: 'CREATED', reverse: true },
  { value: 'title_asc', sortKey: 'TITLE', reverse: false },
];

function getSortParams(sort?: string) {
  return SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];
}

function filterByPrice(
  products: ShopifyProduct[],
  min?: string,
  max?: string
): ShopifyProduct[] {
  const minPrice = min ? parseFloat(min) : null;
  const maxPrice = max ? parseFloat(max) : null;
  return products.filter((p) => {
    const price = parseFloat(p.priceRange.minVariantPrice.amount);
    if (minPrice !== null && price < minPrice) return false;
    if (maxPrice !== null && price > maxPrice) return false;
    return true;
  });
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const { sortKey, reverse } = getSortParams(searchParams.sort);

  const collection = await getCollection({
    handle: params.handle,
    first: 24,
    sortKey,
    reverse,
  });

  if (!collection) notFound();

  const allProducts = collection.products.edges.map((e) => e.node);
  const filtered = filterByPrice(allProducts, searchParams.min, searchParams.max);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-brand-orange transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-navy font-medium">{collection.title}</span>
      </nav>

      {/* Collection header */}
      <div className="mb-8">
        <h1 className="section-title">{collection.title}</h1>
        {collection.description && (
          <p className="section-subtitle mt-2">{collection.description}</p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar — Suspense required because CollectionFilters uses useSearchParams */}
        <aside className="lg:w-64 flex-shrink-0">
          <Suspense fallback={<div className="h-80 bg-gray-50 rounded-xl animate-pulse" />}>
            <CollectionFilters
              currentSort={searchParams.sort ?? 'best_selling'}
              minPrice={searchParams.min}
              maxPrice={searchParams.max}
              productCount={filtered.length}
            />
          </Suspense>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
            {(searchParams.min || searchParams.max) && (
              <span className="ml-2 text-brand-orange">(filtrado por precio)</span>
            )}
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl mb-2">No se encontraron productos</p>
              <p className="text-sm">Intentá ajustar los filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 6} />
              ))}
            </div>
          )}

          {collection.products.pageInfo.hasNextPage && (
            <div className="text-center mt-10">
              <p className="text-gray-400 text-sm">
                Mostrando {filtered.length} de más productos disponibles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
