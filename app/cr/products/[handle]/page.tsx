import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, getProducts } from '@/lib/shopify';
import ProductDetail from '@/components/ProductDetail';

type Props = {
  params: Promise<{ handle: string }>;
};

export const dynamic = 'force-dynamic';

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

export default async function CRProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  // Related products scoped to CR market (Dropi vendor)
  const { products: related } = await getProducts({
    first: 5,
    sortKey: 'BEST_SELLING',
    query: product.productType
      ? `vendor:Dropi product_type:${product.productType}`
      : 'vendor:Dropi',
  });
  const relatedProducts = related.filter((p) => p.handle !== handle).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto md:px-6 lg:px-8 md:py-8">
      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
