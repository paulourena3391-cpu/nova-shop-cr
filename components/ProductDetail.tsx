'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, RefreshCw, Star, ChevronLeft } from 'lucide-react';
import {
  ShopifyProduct,
  ShopifyVariant,
  formatPrice,
  hasDiscount,
  discountPercent,
} from '@/lib/shopify';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LanguageContext';
import ProductCard from './ProductCard';

type Props = {
  product: ShopifyProduct;
  relatedProducts: ShopifyProduct[];
};

export default function ProductDetail({ product, relatedProducts }: Props) {
  const { t } = useLang();
  const { addItem, isLoading } = useCart();

  const images   = product.images.edges.map((e) => e.node);
  const variants = product.variants.edges.map((e) => e.node);

  const [selectedVariant,  setSelectedVariant]  = useState<ShopifyVariant>(variants[0]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [activeTab,        setActiveTab]        = useState<'description' | 'specs'>('description');

  const isOnSale = hasDiscount(product);
  const discount = discountPercent(product);

  const optionNames = [
    ...new Set(variants.flatMap((v) => v.selectedOptions.map((o) => o.name))),
  ];

  function selectOption(name: string, value: string) {
    const updated = (selectedVariant?.selectedOptions ?? []).map((o) =>
      o.name === name ? { name, value } : o
    );
    const match = variants.find((v) =>
      v.selectedOptions.every((o) =>
        updated.some((u) => u.name === o.name && u.value === o.value)
      )
    );
    if (match) setSelectedVariant(match);
  }

  async function handleAddToCart() {
    if (!selectedVariant) return;
    await addItem(selectedVariant.id, 1);
  }

  const currentImage = images[selectedImageIdx] ?? null;
  const price = formatPrice(
    selectedVariant?.price.amount ?? product.priceRange.minVariantPrice.amount,
    selectedVariant?.price.currencyCode ?? product.priceRange.minVariantPrice.currencyCode
  );
  const isAvailable = selectedVariant?.availableForSale ?? false;

  return (
    /* pb-24 leaves room for the mobile sticky bar */
    <div className="pb-24 md:pb-0">

      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 md:mb-8">
        {/* Mobile: just a back arrow + "Inicio" */}
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-brand-orange transition-colors"
        >
          <ChevronLeft size={15} />
          <span>{t.home}</span>
        </Link>

        {/* Desktop: full breadcrumb */}
        {product.productType && (
          <>
            <span className="hidden md:inline">/</span>
            <Link
              href={`/collections/${product.productType.toLowerCase().replace(/\s+/g, '-')}`}
              className="hover:text-brand-orange transition-colors hidden md:inline"
            >
              {product.productType}
            </Link>
            <span className="hidden md:inline">/</span>
          </>
        )}
        <span className="text-navy font-medium truncate max-w-[180px] hidden md:inline">
          {product.title}
        </span>
      </nav>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-16">

        {/* LEFT — image gallery */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-gray-50">
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={currentImage.altText ?? product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200 text-6xl">
                🛍️
              </div>
            )}

            {/* Discount badge */}
            {isOnSale && discount > 0 && (
              <div className="absolute top-3 left-3">
                <span className="badge-orange">-{discount}%</span>
              </div>
            )}

            {/* Image counter (mobile) */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full md:hidden">
                {selectedImageIdx + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnails — touch-friendly */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={img.url}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImageIdx === idx
                      ? 'border-brand-orange'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-label={`Imagen ${idx + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? `Imagen ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — product info */}
        <div className="space-y-4 md:space-y-6">

          {/* Vendor */}
          {product.vendor && (
            <span className="text-brand-orange font-semibold text-xs uppercase tracking-widest">
              {product.vendor}
            </span>
          )}

          {/* Title */}
          <h1 className="font-display text-xl md:text-4xl text-navy leading-tight font-bold">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">4.0 (24 reseñas)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl md:text-3xl font-bold text-navy">{price}</span>
            {isOnSale && (
              <>
                <span className="text-base text-gray-400 line-through">
                  {formatPrice(
                    selectedVariant?.compareAtPrice?.amount ??
                      product.compareAtPriceRange.minVariantPrice.amount,
                    product.compareAtPriceRange.minVariantPrice.currencyCode
                  )}
                </span>
                <span className="badge-orange text-xs">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Variant selectors */}
          {optionNames.map((optName) => {
            const optValues = [
              ...new Set(
                variants.flatMap((v) =>
                  v.selectedOptions
                    .filter((o) => o.name === optName)
                    .map((o) => o.value)
                )
              ),
            ];
            const selectedValue = selectedVariant?.selectedOptions.find(
              (o) => o.name === optName
            )?.value;

            return (
              <div key={optName}>
                <label className="block text-sm font-semibold text-navy mb-2.5">
                  {optName}:{' '}
                  <span className="font-normal text-gray-500">{selectedValue}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {optValues.map((val) => {
                    const variantForOption = variants.find((v) =>
                      v.selectedOptions.some((o) => o.name === optName && o.value === val)
                    );
                    const available = variantForOption?.availableForSale ?? false;
                    return (
                      <button
                        key={val}
                        onClick={() => selectOption(optName, val)}
                        disabled={!available}
                        className={`min-w-[3rem] px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all active:scale-95 ${
                          selectedValue === val
                            ? 'border-brand-orange bg-brand-orange-light text-brand-orange'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        } ${!available ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Add to cart — desktop only (mobile uses sticky bar) */}
          <div className="hidden md:flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable || isLoading}
              className="btn-primary flex-1 py-4 text-base shadow-lg shadow-brand-orange/30"
            >
              {isAvailable ? t.addToCart : t.outOfStock}
            </button>
            {isAvailable && (
              <Link href="/cart" className="btn-secondary py-4 px-6 text-base">
                {t.buyNow}
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 py-4 border-y border-gray-100">
            {[
              { Icon: ShieldCheck, label: t.securePay,    color: 'text-green-500'  },
              { Icon: Truck,       label: t.fastShipping, color: 'text-blue-500'   },
              { Icon: RefreshCw,   label: t.trustReturns, color: 'text-purple-500' },
            ].map(({ Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <Icon size={18} className={color} />
                <span className="text-xs text-gray-600 font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="badge bg-gray-100 text-gray-600 text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Description / Specs tabs ──────────────────────────── */}
      <div className="mt-10 md:mt-14">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            {(['description', 'specs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-brand-orange text-brand-orange'
                    : 'border-transparent text-gray-500 hover:text-navy'
                }`}
              >
                {tab === 'description' ? t.description : t.specifications}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'description' ? (
          <div
            className="prose max-w-none text-gray-600 leading-relaxed text-sm md:text-base"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ['Vendor',    product.vendor],
              ['Type',      product.productType],
              ['SKU',       selectedVariant?.id.split('/').pop() ?? '—'],
              ['Available', product.availableForSale ? 'Yes' : 'No'],
            ]
              .filter(([, v]) => Boolean(v))
              .map(([key, val]) => (
                <div
                  key={key}
                  className="flex justify-between py-3 border-b border-gray-100 text-sm"
                >
                  <span className="font-medium text-navy">{key}</span>
                  <span className="text-gray-600">{val}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ── Related products ──────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 md:mt-16">
          <h2 className="section-title mb-6 md:mb-8 text-2xl md:text-4xl">
            {t.relatedProducts}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── Sticky Add-to-Cart bar — mobile only ─────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 sticky-safe-bottom">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Price + selected variant summary */}
          <div className="flex-1 min-w-0">
            {selectedVariant?.selectedOptions.length > 0 && (
              <p className="text-xs text-gray-400 truncate">
                {selectedVariant.selectedOptions.map((o) => o.value).join(' · ')}
              </p>
            )}
            <p className="text-base font-bold text-navy leading-tight">{price}</p>
          </div>

          {/* CTA buttons */}
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable || isLoading}
            className="btn-primary px-5 py-3 text-sm shrink-0 active:scale-95"
          >
            {isAvailable ? t.addToCart : t.outOfStock}
          </button>

          {isAvailable && (
            <Link href="/cart" className="btn-secondary px-4 py-3 text-sm shrink-0">
              {t.buyNow}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
