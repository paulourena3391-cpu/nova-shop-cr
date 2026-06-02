// Server Component — fetches real product images and links each to its product page
import Image from 'next/image';
import Link from 'next/link';
import { getCollection } from '@/lib/shopify';

type Props = {
  handle: string;
  title: string;
  shopNow: string;
};

export default async function CategoryCard({ handle, title, shopNow }: Props) {
  let products: Array<{
    id: string;
    title: string;
    handle: string;
    image: { url: string; altText: string | null } | null;
  }> = [];

  try {
    const collection = await getCollection({ handle, first: 4 });
    products = collection?.products.edges.slice(0, 4).map((e) => ({
      id: e.node.id,
      title: e.node.title,
      handle: e.node.handle,
      image: e.node.images.edges[0]?.node ?? null,
    })) ?? [];
  } catch {
    // silently fail
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      {/* Category title → links to collection */}
      <Link href={`/collections/${handle}`}>
        <h3 className="font-bold text-navy text-lg mb-3 hover:text-brand-orange transition-colors">
          {title}
        </h3>
      </Link>

      {/* 2×2 product grid — each image links to its product */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {products.length > 0 ? (
          <>
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.handle}`}
                className="block aspect-square bg-gray-50 rounded overflow-hidden group"
                title={p.title}
              >
                {p.image ? (
                  <Image
                    src={p.image.url}
                    alt={p.image.altText ?? p.title}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </Link>
            ))}
            {/* Fill empty slots if fewer than 4 products */}
            {Array.from({ length: Math.max(0, 4 - products.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-gray-50 rounded" />
            ))}
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded animate-pulse" />
          ))
        )}
      </div>

      {/* "Shop now" → links to full collection */}
      <Link
        href={`/collections/${handle}`}
        className="text-sm text-blue-600 hover:text-brand-orange font-medium transition-colors"
      >
        {shopNow} →
      </Link>
    </div>
  );
}
