// Server Component — fetches real product images, uses client labels for bilingual text
import Image from 'next/image';
import Link from 'next/link';
import { getCollection } from '@/lib/shopify';
import { CategoryCardTitle, CategoryShopNow } from './CategoryCardLabels';

type Props = {
  handle: string;
  titleEs: string;
  titleEn: string;
};

export default async function CategoryCard({ handle, titleEs, titleEn }: Props) {
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
    // silently fail — card shows empty placeholders
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ease-premium">
      {/* Bilingual title — client component reads language context */}
      <CategoryCardTitle handle={handle} titleEs={titleEs} titleEn={titleEn} />

      {/* 2×2 product grid — each image links to its product */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {products.length > 0 ? (
          <>
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.handle}`}
                className="block aspect-square bg-gray-50 rounded-xl overflow-hidden group"
                title={p.title}
              >
                {p.image ? (
                  <Image
                    src={p.image.url}
                    alt={p.image.altText ?? p.title}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-premium"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </Link>
            ))}
            {/* Fill empty slots if fewer than 4 products */}
            {Array.from({ length: Math.max(0, 4 - products.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-gray-50 rounded-xl" />
            ))}
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded animate-pulse" />
          ))
        )}
      </div>

      {/* Bilingual "Shop now / Comprar ahora" — client component */}
      <CategoryShopNow handle={handle} />
    </div>
  );
}
