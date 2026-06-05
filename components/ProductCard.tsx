'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Eye, Heart } from 'lucide-react';
import {
  ShopifyProduct, formatPrice, getFirstImage,
  getFirstVariant, hasDiscount, discountPercent,
} from '@/lib/shopify';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useLang } from '@/context/LanguageContext';
import { useState } from 'react';

type Props = {
  product: ShopifyProduct;
  priority?: boolean;
  basePath?: string;
};

export default function ProductCard({ product, priority = false, basePath = '' }: Props) {
  const { addItem, isLoading } = useCart();
  const { showToast } = useToast();
  const { t } = useLang();
  const [adding, setAdding] = useState(false);
  const [wished, setWished] = useState(false);

  const image = getFirstImage(product);
  const variant = getFirstVariant(product);
  const isOnSale = hasDiscount(product);
  const discount = discountPercent(product);

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!variant || adding) return;
    setAdding(true);
    try {
      await addItem(variant.id, 1);
      showToast(`"${product.title.slice(0, 30)}..." agregado al carrito`, 'cart');
    } catch {
      showToast('Error al agregar. Intentá de nuevo.', 'error');
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 ease-premium flex flex-col">

      {/* ── Image wrapper ── */}
      <Link href={`${basePath}/products/${product.handle}`} className="block relative overflow-hidden">
        <div className="relative aspect-square bg-gray-50">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ShoppingCart size={40} className="text-gray-300" />
            </div>
          )}

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          {/* Quick view button — appears on hover */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span className="bg-white/95 backdrop-blur text-navy text-xs font-semibold px-4 py-1.5 rounded-full shadow flex items-center gap-1.5">
              <Eye size={13} />
              {t.viewAll === 'Ver todo' ? 'Vista rápida' : 'Quick view'}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOnSale && discount > 0 && (
            <span className="badge-orange text-[11px] shadow">-{discount}%</span>
          )}
          {!product.availableForSale && (
            <span className="badge bg-gray-700 text-white text-[11px]">{t.outOfStock}</span>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={() => setWished(!wished)}
        className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center transition-all duration-200 hover:scale-110 ${
          wished ? 'text-red-500' : 'text-gray-300 opacity-0 group-hover:opacity-100'
        }`}
        aria-label="Guardar en lista"
      >
        <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
      </button>

      {/* ── Content ── */}
      <div className="p-3 flex flex-col flex-1">
        {product.vendor && (
          <span className="text-[10px] text-brand-orange font-bold uppercase tracking-widest">
            {product.vendor}
          </span>
        )}

        <Link href={`${basePath}/products/${product.handle}`}>
          <h3 className="text-sm font-semibold text-navy mt-0.5 line-clamp-2 hover:text-brand-orange transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1 mt-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={11}
              className={i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
          ))}
          <span className="text-[10px] text-gray-400 ml-0.5">(24)</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2.5">
          <span className="text-lg font-extrabold text-navy tracking-tight">
            {formatPrice(
              product.priceRange.minVariantPrice.amount,
              product.priceRange.minVariantPrice.currencyCode,
            )}
          </span>
          {isOnSale && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(
                product.compareAtPriceRange.minVariantPrice.amount,
                product.compareAtPriceRange.minVariantPrice.currencyCode,
              )}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!product.availableForSale || adding}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-premium disabled:opacity-50 disabled:cursor-not-allowed
            ${adding
              ? 'bg-green-500 text-white scale-95'
              : 'bg-navy text-white hover:bg-brand-orange hover:shadow-cta active:scale-95'
            }`}
        >
          {adding ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Agregando...
            </>
          ) : (
            <>
              <ShoppingCart size={14} />
              {product.availableForSale ? t.addToCart : t.outOfStock}
            </>
          )}
        </button>
      </div>
    </article>
  );
}
