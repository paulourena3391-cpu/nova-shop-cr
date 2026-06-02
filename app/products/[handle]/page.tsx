// Next.js 15+ — params must be awaited
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, getProducts } from '@/lib/shopify';
import ProductDetail from '@/components/ProductDetail';

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateStaticParams() {
  try {
    const { products } = await getProducts({ first: 50 });
    return products.map((p) => ({ handle: p.handle }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    openGraph: {
      images: product.images.edges[0]
        ? [{ url: product.images.edges[0].node.url }]
        : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const { products: related } = await getProducts({
    first: 5,
    sortKey: 'BEST_SELLING',
    query: product.productType ? `product_type:${product.productType}` : undefined,
  });
  const relatedProducts = related
    .filter((p) => p.handle !== handle)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
