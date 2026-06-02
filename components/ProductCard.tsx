'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { ShopifyProduct, formatPrice, getFirstImage, getFirstVariant, hasDiscount, discountPercent } from '@/lib/shopify';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LanguageContext';

type Props = {
  product: ShopifyProduct;
  priority?: boolean;
};

export default function ProductCard({ product, priority = false }: Props) {
  const { addItem, isLoading } = useCart();
  const { t } = useLang();

  const image = getFirstImage(product);
  const variant = getFirstVariant(product);
  const isOnSale = hasDiscount(product);
  const discount = discountPercent(product);

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!variant) return;
    await addItem(variant.id, 1);
  }

  return (
    <article className="group card overflow-hidden flex flex-col">
      {/* Image wrapper */}
      <Link href={`/products/${product.handle}`} className="block relative">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart size={40} className="text-gray-200" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOnSale && discount > 0 && (
              <span className="badge-orange text-[11px]">-{discount}%</span>
            )}
            {!product.availableForSale && (
              <span className="badge bg-gray-800 text-white text-[11px]">
                {t.outOfStock}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Vendor */}
        {product.vendor && (
          <span className="text-xs text-brand-orange font-semibold uppercase tracking-wide">
            {product.vendor}
          </span>
        )}

        {/* Title */}
        <Link href={`/products/${product.handle}`}>
          <h3 className="text-sm font-semibold text-navy mt-0.5 line-clamp-2 hover:text-brand-orange transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Stars placeholder — real ratings require Shopify Reviews app */}
        <div className="flex items-center gap-1 mt-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={11}
              className={i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
            />
          ))}
          <span className="text-xs text-gray-400">(24)</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-bold text-navy">
            {formatPrice(
              product.priceRange.minVariantPrice.amount,
              product.priceRange.minVariantPrice.currencyCode
            )}
          </span>
          {isOnSale && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(
                product.compareAtPriceRange.minVariantPrice.amount,
                product.compareAtPriceRange.minVariantPrice.currencyCode
              )}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!product.availableForSale || isLoading}
          className="mt-3 w-full btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`${t.addToCart}: ${product.title}`}
        >
          <ShoppingCart size={15} />
          {product.availableForSale ? t.addToCart : t.outOfStock}
        </button>
      </div>
    </article>
  );
}
