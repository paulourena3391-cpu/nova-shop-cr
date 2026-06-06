import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProducts, ShopifyProduct } from '@/lib/shopify';
import ProductCard from '@/components/ProductCard';
import CollectionFilters from '@/components/CollectionFilters';

type PageProps = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ sort?: string; min?: string; max?: string }>;
};

export const dynamic = 'force-dynamic';

// Mapeo handle → título y query de productos
const CR_COLLECTION_MAP: Record<string, { title: string; query: string }> = {
  'cr-tecnologia':  { title: 'Tecnología',    query: 'tag:market-cr product_type:Electronics'      },
  'cr-belleza':     { title: 'Belleza',        query: 'tag:market-cr product_type:Beauty'            },
  'cr-moda-mujer':  { title: 'Moda Mujer',     query: "tag:market-cr product_type:Women's Clothing"  },
  'cr-moda-hombre': { title: 'Moda Hombre',    query: "tag:market-cr product_type:Men's Clothing"    },
  'cr-calzado':     { title: 'Calzado',        query: 'tag:market-cr product_type:Footwear'          },
  'cr-hogar':       { title: 'Hogar',          query: 'tag:market-cr product_type:Home & Living'     },
  'cr-deportes':    { title: 'Fitness',        query: 'tag:market-cr product_type:Sports & Fitness'  },
  'cr-mascotas':    { title: 'Mascotas',       query: 'tag:market-cr product_type:Pet Supplies'      },
  'cr-swimwear':    { title: 'Trajes de Baño', query: 'tag:market-cr product_type:Swimwear'          },
  'cr-calzado-hombre': { title: 'Calzado de Hombre', query: "tag:market-cr product_type:Men's Footwear" },
  'cr-herramientas':   { title: 'Herramientas',      query: 'tag:market-cr product_type:Tools'           },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const col = CR_COLLECTION_MAP[handle];
  if (!col) return {};
  return {
    title: col.title,
    description: `Comprá ${col.title} en Nova Shop CR con envío incluido.`,
  };
}

function filterByPrice(products: ShopifyProduct[], min?: string, max?: string): ShopifyProduct[] {
  const minP = min ? parseFloat(min) : null;
  const maxP = max ? parseFloat(max) : null;
  return products.filter((p) => {
    const price = parseFloat(p.priceRange.minVariantPrice.amount);
    if (minP !== null && price < minP) return false;
    if (maxP !== null && price > maxP) return false;
    return true;
  });
}

export default async function CRCollectionPage({ params, searchParams }: PageProps) {
  const { handle } = await params;
  const { sort, min, max } = await searchParams;

  const col = CR_COLLECTION_MAP[handle];
  if (!col) notFound();

  // Shopify sortKey from sort param
  const sortMap: Record<string, { sortKey: 'BEST_SELLING' | 'PRICE' | 'CREATED_AT' | 'TITLE'; reverse: boolean }> = {
    best_selling: { sortKey: 'BEST_SELLING', reverse: false },
    price_asc:    { sortKey: 'PRICE',        reverse: false },
    price_desc:   { sortKey: 'PRICE',        reverse: true  },
    newest:       { sortKey: 'CREATED_AT',   reverse: true  },
    title_asc:    { sortKey: 'TITLE',        reverse: false },
  };
  const { sortKey, reverse } = sortMap[sort ?? 'best_selling'] ?? sortMap['best_selling'];

  const { products: allProducts } = await getProducts({
    first: 48,
    query: col.query,
    sortKey,
    reverse,
  });

  const filtered = filterByPrice(allProducts, min, max);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/cr" className="hover:text-brand-orange transition-colors">Inicio</Link>
        <span>/</span>
        <span className="text-navy font-medium">{col.title}</span>
      </nav>

      <div className="mb-8">
        <h1 className="section-title">{col.title}</h1>
        <p className="text-gray-500 text-sm mt-1">Envío incluido en el precio • Entrega en Costa Rica</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <Suspense fallback={<div className="h-80 bg-gray-50 rounded-xl animate-pulse" />}>
            <CollectionFilters
              currentSort={sort ?? 'best_selling'}
              minPrice={min}
              maxPrice={max}
              productCount={filtered.length}
            />
          </Suspense>
        </aside>

        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl mb-2">No se encontraron productos</p>
              <p className="text-sm">Intentá ajustar los filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 6} basePath="/cr" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
