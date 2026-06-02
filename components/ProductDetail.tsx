'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, RefreshCw, Star, ZoomIn } from 'lucide-react';
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

  const images = product.images.edges.map((e) => e.node);
  const variants = product.variants.edges.map((e) => e.node);

  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant>(variants[0]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');

  const isOnSale = hasDiscount(product);
  const discount = discountPercent(product);

  // Unique option names across all variants (e.g. "Color", "Size")
  const optionNames = [
    ...new Set(variants.flatMap((v) => v.selectedOptions.map((o) => o.name))),
  ];

  function selectOption(name: string, value: string) {
    const currentOptions = selectedVariant?.selectedOptions ?? [];
    const updatedOptions = currentOptions.map((o) =>
      o.name === name ? { name, value } : o
    );
    const match = variants.find((v) =>
      v.selectedOptions.every((o) =>
        updatedOptions.some((u) => u.name === o.name && u.value === o.value)
      )
    );
    if (match) setSelectedVariant(match);
  }

  async function handleAddToCart() {
    if (!selectedVariant) return;
    await addItem(selectedVariant.id, 1);
  }

  const currentImage = images[selectedImageIdx] ?? null;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-brand-orange transition-colors">
          {t.home}
        </Link>
        <span>/</span>
        {product.productType && (
          <>
            <Link
              href={`/collections/${product.productType.toLowerCase().replace(/\s+/g, '-')}`}
              className="hover:text-brand-orange transition-colors"
            >
              {product.productType}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-navy font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main product grid */}
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: Image gallery */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 group cursor-zoom-in">
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={currentImage.altText ?? product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200 text-6xl">
                🛍️
              </div>
            )}

            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isOnSale && discount > 0 && (
                <span className="badge-orange text-sm">-{discount}%</span>
              )}
            </div>
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={18} className="text-navy" />
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.url}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImageIdx === idx
                      ? 'border-brand-orange'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-label={`Image ${idx + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? `Product image ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product info */}
        <div className="space-y-6">
          {product.vendor && (
            <span className="text-brand-orange font-semibold text-sm uppercase tracking-wide">
              {product.vendor}
            </span>
          )}

          <h1 className="font-display text-3xl md:text-4xl text-navy leading-tight">
            {product.title}
          </h1>

          {/* Rating (placeholder — needs Shopify Reviews app for real data) */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">4.0 (24 reseñas)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-navy">
              {formatPrice(
                selectedVariant?.price.amount ?? product.priceRange.minVariantPrice.amount,
                selectedVariant?.price.currencyCode ??
                  product.priceRange.minVariantPrice.currencyCode
              )}
            </span>
            {isOnSale && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(
                    selectedVariant?.compareAtPrice?.amount ??
                      product.compareAtPriceRange.minVariantPrice.amount,
                    product.compareAtPriceRange.minVariantPrice.currencyCode
                  )}
                </span>
                <span className="badge-orange">{discount}% OFF</span>
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
                <label className="block text-sm font-semibold text-navy mb-2">
                  {optName}:{' '}
                  <span className="font-normal text-gray-500">{selectedValue}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {optValues.map((val) => {
                    const variantForOption = variants.find((v) =>
                      v.selectedOptions.some((o) => o.name === optName && o.value === val)
                    );
                    const isAvailable = variantForOption?.availableForSale ?? false;

                    return (
                      <button
                        key={val}
                        onClick={() => selectOption(optName, val)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                          selectedValue === val
                            ? 'border-brand-orange bg-brand-orange-light text-brand-orange'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        } ${!isAvailable ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Add to cart + Buy now */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!product.availableForSale || isLoading || !selectedVariant}
              className="btn-primary flex-1 py-4 text-base shadow-lg shadow-brand-orange/30 disabled:opacity-50"
            >
              {product.availableForSale ? t.addToCart : t.outOfStock}
            </button>
            {product.availableForSale && (
              <Link href="/cart" className="btn-secondary py-4 px-6 text-base">
                {t.buyNow}
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 py-4 border-y border-gray-100">
            {[
              { Icon: ShieldCheck, label: t.securePay, color: 'text-green-500' },
              { Icon: Truck, label: t.fastShipping, color: 'text-blue-500' },
              { Icon: RefreshCw, label: t.trustReturns, color: 'text-purple-500' },
            ].map(({ Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                <Icon size={20} className={color} />
                <span className="text-xs text-gray-600 font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="badge bg-gray-100 text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description / Specs tabs */}
      <div className="mt-14">
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
            className="prose max-w-none text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ['Vendor', product.vendor],
              ['Type', product.productType],
              ['SKU', selectedVariant?.id.split('/').pop() ?? '—'],
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

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-8">{t.relatedProducts}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
