'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, RefreshCw, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ShopifyProduct,
  ShopifyVariant,
  formatPrice,
  formatPriceCR,
  hasDiscount,
  discountPercent,
} from '@/lib/shopify';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';
import ProductCard from './ProductCard';
import ProductUrgency from './product/ProductUrgency';
import ProductBenefits from './product/ProductBenefits';
import ProductComparison from './product/ProductComparison';
import ProductReviews from './product/ProductReviews';

type Props = {
  product: ShopifyProduct;
  relatedProducts: ShopifyProduct[];
};

export default function ProductDetail({ product, relatedProducts }: Props) {
  const { t, lang } = useLang();
  const { isCR, basePath } = useMarket();
  const fmt = isCR ? formatPriceCR : formatPrice;
  const home = basePath || '/';
  const { addItem, isLoading } = useCart();
  const router = useRouter();

  const images   = product.images.edges.map((e) => e.node);
  const variants = product.variants.edges.map((e) => e.node);

  const [selectedVariant,  setSelectedVariant]  = useState<ShopifyVariant>(variants[0]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [activeTab,        setActiveTab]        = useState<'description' | 'specs'>('description');
  const [bundleQty,        setBundleQty]        = useState(1);

  // Always land at the top (image first) when opening a product
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [product.id]);

  // Image gallery navigation
  const thumbsRef = useRef<HTMLDivElement>(null);
  const goPrev = () => setSelectedImageIdx((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setSelectedImageIdx((i) => (i + 1) % images.length);

  // Keep the active thumbnail scrolled into view
  useEffect(() => {
    const strip = thumbsRef.current;
    if (!strip) return;
    const active = strip.children[selectedImageIdx] as HTMLElement | undefined;
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedImageIdx]);

  const isOnSale  = hasDiscount(product);
  const discount  = discountPercent(product);
  const isAvailable = selectedVariant?.availableForSale ?? false;

  const optionNames = [
    ...new Set(variants.flatMap((v) => v.selectedOptions.map((o) => o.name))),
  ];

  const colorOptionName = optionNames.find((n) => /color/i.test(n));

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

    if (name === colorOptionName) {
      // 1) If the variant has its own distinct photo → use that (most accurate).
      const sharedImage = new Set(variants.map((v) => v.image?.url)).size <= 1;
      if (match?.image?.url && !sharedImage) {
        const exactIdx = images.findIndex((img) => img.url === match.image!.url);
        if (exactIdx >= 0) { setSelectedImageIdx(exactIdx); return; }
      }
      // 2) Numbered styles ("3Style", "Style 2", "Color 4") → the number IS the photo
      //    index, so mapping is reliable. This is exactly where names are useless.
      const numMatch = value.match(/\d+/);
      if (numMatch && images.length > 1) {
        const n = parseInt(numMatch[0], 10);
        if (n >= 1 && n <= images.length) setSelectedImageIdx(n - 1);
      }
    }
  }

  async function handleAddToCart() {
    if (!selectedVariant) return;
    await addItem(selectedVariant.id, bundleQty);
  }

  // Buy Now: add item first, THEN go to cart (fixes empty-cart bug)
  async function handleBuyNow() {
    if (!selectedVariant || !isAvailable) return;
    await addItem(selectedVariant.id, bundleQty);
    router.push('/cart');
  }

  const currentImage = images[selectedImageIdx] ?? null;
  const unitAmount = parseFloat(
    selectedVariant?.price.amount ?? product.priceRange.minVariantPrice.amount,
  );
  const currency = selectedVariant?.price.currencyCode ?? product.priceRange.minVariantPrice.currencyCode;
  const price = fmt(String(unitAmount), currency);

  // Bundle tiers — buy more, save more (real discount set via Shopify automatic discount)
  const es = lang === 'es';
  const BUNDLES = [
    { qty: 1, off: 0,  labelEs: '1 unidad',  labelEn: '1 unit',   tagEs: '',              tagEn: '' },
    { qty: 2, off: 10, labelEs: '2 unidades', labelEn: '2 units', tagEs: 'MÁS POPULAR',   tagEn: 'MOST POPULAR' },
    { qty: 3, off: 15, labelEs: '3 unidades', labelEn: '3 units', tagEs: 'MEJOR VALOR',   tagEn: 'BEST VALUE' },
  ];

  // Sticky-bar pricing: reflect the chosen bundle so mobile shoppers see the real total.
  const selectedBundle = BUNDLES.find((b) => b.qty === bundleQty) ?? BUNDLES[0];
  const bundleTotalAmount = unitAmount * bundleQty * (1 - selectedBundle.off / 100);
  const stickyPrice = bundleQty > 1 ? fmt(String(bundleTotalAmount), currency) : price;

  // The non-color option (size/spec) — surfaced in the CR sticky bar for one-tap selection.
  const sizeOptionName = optionNames.find((n) => !/color/i.test(n));
  const sizeValues = sizeOptionName
    ? [...new Set(
        variants.flatMap((v) =>
          v.selectedOptions.filter((o) => o.name === sizeOptionName).map((o) => o.value),
        ),
      )]
    : [];
  const selectedSizeValue = selectedVariant?.selectedOptions.find(
    (o) => o.name === sizeOptionName,
  )?.value;

  return (
    /* pb-* = room for the sticky mobile bar (taller smart bar on /cr) */
    <div className={`${isCR ? 'pb-36' : 'pb-24'} md:pb-0`}>

      {/* ── MOBILE: Back button (above image, inside image area) ──
           DESKTOP: breadcrumb below the grid  */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 md:hidden">
        <Link
          href={home}
          className="flex items-center gap-1 text-white bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-medium active:opacity-70 transition-opacity"
        >
          <ChevronLeft size={14} />
          {t.home}
        </Link>
      </div>

      {/* ── Main layout: single column on mobile, 2-col on desktop ── */}
      <div className="md:grid md:grid-cols-2 md:gap-12 lg:gap-16">

        {/* ════ LEFT — IMAGE GALLERY ════ */}
        <div>
          {/*
            On mobile: image escapes the container (negative margin) → true edge-to-edge
            On desktop (md+): normal contained box
          */}
          <div className="-mt-11 md:mt-0">   {/* pull up to cover the back-button row on mobile */}
            <div className={`group relative w-full overflow-hidden bg-gray-100 md:rounded-2xl ${isCR ? 'h-[56vh] md:h-auto md:aspect-square' : 'aspect-square'}`}>
              {currentImage ? (
                <Image
                  key={selectedImageIdx}
                  src={currentImage.url}
                  alt={currentImage.altText ?? product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover animate-image-reveal"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🛍️</div>
              )}

              {/* Prev / Next arrows — appear on hover (desktop), always visible (mobile) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    aria-label="Anterior"
                    className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/85 backdrop-blur shadow-md flex items-center justify-center text-navy hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={goNext}
                    aria-label="Siguiente"
                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/85 backdrop-blur shadow-md flex items-center justify-center text-navy hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Back button overlay (sits on top of image on mobile) */}
              <div className="absolute top-3 left-3 flex gap-2 md:hidden">
                <Link
                  href={home}
                  className="flex items-center gap-1 text-white bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-medium"
                >
                  <ChevronLeft size={14} />
                  {t.home}
                </Link>
              </div>

              {/* Discount badge */}
              {isOnSale && discount > 0 && (
                <div className="absolute top-3 right-3">
                  <span className="badge-orange text-xs font-bold px-2.5 py-1">-{discount}%</span>
                </div>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                  {selectedImageIdx + 1} / {images.length}
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail strip — scrolls, with active auto-centering */}
          {images.length > 1 && (
            <div ref={thumbsRef} className="flex gap-2 overflow-x-auto py-3 px-4 md:px-0 scrollbar-hide scroll-smooth">
              {images.map((img, idx) => (
                <button
                  key={img.url}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIdx === idx
                      ? 'border-brand-orange ring-2 ring-brand-orange/20 scale-105'
                      : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt={`${idx + 1}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ════ RIGHT — PRODUCT INFO ════ */}
        <div className="px-4 md:px-0 md:py-2 space-y-5">

          {/* Desktop breadcrumb */}
          <nav className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <Link href={home} className="hover:text-brand-orange transition-colors">{t.home}</Link>
            {product.productType && (
              <>
                <span>/</span>
                {/* On /cr the productType slug doesn't map to a cr-* collection, so show plain text */}
                {isCR ? (
                  <span>{product.productType}</span>
                ) : (
                  <Link
                    href={`/collections/${product.productType.toLowerCase().replace(/\s+/g, '-')}`}
                    className="hover:text-brand-orange transition-colors"
                  >
                    {product.productType}
                  </Link>
                )}
                <span>/</span>
              </>
            )}
            <span className="text-navy font-medium truncate max-w-[200px]">{product.title}</span>
          </nav>

          {/* Vendor */}
          {product.vendor && (
            <p className="text-brand-orange font-bold text-xs uppercase tracking-widest pt-4 md:pt-0">
              {product.vendor}
            </p>
          )}

          {/* Title */}
          <h1 className="text-xl md:text-3xl font-bold text-navy leading-snug">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14}
                  className={i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
              ))}
            </div>
            <span className="text-xs text-gray-400">4.0 · 24 reseñas</span>
          </div>

          {/* ── Price ── */}
          <div className="flex items-baseline gap-3 flex-wrap py-1">
            <span className="text-3xl font-extrabold text-navy">{price}</span>
            {isOnSale && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {fmt(
                    selectedVariant?.compareAtPrice?.amount ??
                      product.compareAtPriceRange.minVariantPrice.amount,
                    product.compareAtPriceRange.minVariantPrice.currencyCode,
                  )}
                </span>
                <span className="badge-orange text-xs">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* ── Variant selectors ── */}
          {optionNames.map((optName) => {
            const optValues = [
              ...new Set(
                variants.flatMap((v) =>
                  v.selectedOptions.filter((o) => o.name === optName).map((o) => o.value)
                )
              ),
            ];
            const selectedValue = selectedVariant?.selectedOptions.find(
              (o) => o.name === optName
            )?.value;

            return (
              <div key={optName} className="space-y-2">
                <p className="text-sm font-semibold text-navy">
                  {optName}:{' '}
                  <span className="font-normal text-gray-500">{selectedValue}</span>
                </p>
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
                        className={`min-w-[3rem] px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all active:scale-95 select-none ${
                          selectedValue === val
                            ? 'border-brand-orange bg-orange-50 text-brand-orange'
                            : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300'
                        } ${!available ? 'opacity-35 cursor-not-allowed line-through' : ''}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* ── Bundle selector — buy more, save more ── */}
          <div className="space-y-2 pt-1">
            <p className="text-sm font-semibold text-navy">
              {es ? '📦 Comprá más y ahorrá' : '📦 Buy more, save more'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {BUNDLES.map((b) => {
                const totalBefore = unitAmount * b.qty;
                const totalAfter = totalBefore * (1 - b.off / 100);
                const active = bundleQty === b.qty;
                return (
                  <button
                    key={b.qty}
                    onClick={() => setBundleQty(b.qty)}
                    className={`relative rounded-xl border-2 p-3 text-center transition-all duration-300 ease-premium active:scale-95 ${
                      active
                        ? 'border-brand-orange bg-orange-50 shadow-cta'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {b.tagEs && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-brand-orange text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                        {es ? b.tagEs : b.tagEn}
                      </span>
                    )}
                    <p className={`text-sm font-bold ${active ? 'text-brand-orange' : 'text-navy'}`}>
                      {es ? b.labelEs : b.labelEn}
                    </p>
                    {b.off > 0 ? (
                      <>
                        <p className="text-xs font-semibold text-emerald-600 mt-0.5">-{b.off}%</p>
                        <p className="text-[11px] text-gray-400 line-through">{fmt(String(totalBefore), currency)}</p>
                        <p className="text-xs font-bold text-navy">{fmt(String(totalAfter), currency)}</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500 mt-0.5">{fmt(String(totalBefore), currency)}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Add to cart + Buy Now — visible on ALL screens ──
               Mobile: stacked full-width (Amazon style)
               Desktop: side by side                          */}
          <div className="flex flex-col gap-2 pt-1 md:flex-row md:gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable || isLoading}
              className="btn-primary w-full py-4 text-base shadow-lg shadow-brand-orange/25"
            >
              {isAvailable ? t.addToCart : t.outOfStock}
            </button>
            {isAvailable && (
              <button
                onClick={handleBuyNow}
                disabled={isLoading}
                className="btn-secondary w-full py-4 md:px-6 md:w-auto text-base"
              >
                {t.buyNow}
              </button>
            )}
          </div>

          {/* ── Urgency + delivery estimate ── */}
          <ProductUrgency />

          {/* ── Trust strip ── */}
          <div className="grid grid-cols-3 gap-2 py-4 border-y border-gray-100">
            {[
              { Icon: ShieldCheck, label: t.securePay,    color: 'text-emerald-500' },
              { Icon: Truck,       label: t.fastShipping, color: 'text-blue-500'    },
              { Icon: RefreshCw,   label: t.trustReturns, color: 'text-purple-500'  },
            ].map(({ Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <Icon size={18} className={color} />
                <span className="text-xs text-gray-500 font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Description / Specs ─────────────────────────────────── */}
      <div className="mt-8 px-4 md:px-0 md:mt-14">
        <div className="border-b border-gray-200 mb-5">
          <div className="flex gap-6">
            {(['description', 'specs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-brand-orange text-brand-orange'
                    : 'border-transparent text-gray-400 hover:text-navy'
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
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              [es ? 'Marca' : 'Brand',          product.vendor],
              [es ? 'Categoría' : 'Category',   product.productType],
              [es ? 'Disponibilidad' : 'Availability',
                product.availableForSale ? (es ? 'En stock' : 'In stock') : (es ? 'Agotado' : 'Out of stock')],
              [es ? 'Envío' : 'Shipping',       es ? 'Gratis a CR y USA' : 'Free to CR & USA'],
            ]
              .filter(([, v]) => Boolean(v))
              .map(([key, val]) => (
                <div key={key} className="flex justify-between py-3 border-b border-gray-100 text-sm">
                  <span className="font-medium text-navy">{key}</span>
                  <span className="text-gray-500">{val}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ── Conversion sections ─────────────────────────────────── */}
      <ProductBenefits />
      <ProductComparison />
      <ProductReviews photos={images.slice(0, 6).map((i) => i.url)} />

      {/* ── Related products ────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 px-4 md:px-0 md:mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tightest mb-6 inline-flex items-center gap-3">
            <span className="w-1.5 h-7 bg-brand-orange rounded-full" />
            {t.relatedProducts}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} basePath={basePath} />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          STICKY BOTTOM BAR — mobile only
          ══════════════════════════════════════════════════════════ */}
      {!isCR ? (
        /* USA store — unchanged */
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 sticky-safe-bottom">
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Price + variant summary */}
            <div className="flex-1 min-w-0">
              {selectedVariant?.selectedOptions && selectedVariant.selectedOptions.length > 0 && (
                <p className="text-xs text-gray-400 truncate leading-none mb-0.5">
                  {selectedVariant.selectedOptions.map((o) => o.value).join(' · ')}
                </p>
              )}
              <p className="text-lg font-extrabold text-navy leading-none">{price}</p>
            </div>

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable || isLoading}
              className="btn-primary px-5 py-3 text-sm shrink-0 shadow-lg shadow-brand-orange/30"
            >
              {isAvailable ? t.addToCart : t.outOfStock}
            </button>

            {isAvailable && (
              <button
                onClick={handleBuyNow}
                disabled={isLoading}
                className="btn-secondary px-4 py-3 text-sm shrink-0"
              >
                {t.buyNow}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* CR store — smart conversion bar: pick size + see bundle price + CTA, no scroll */
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-8px_24px_rgba(15,27,45,0.08)] sticky-safe-bottom">
          {/* Quick size / spec picker — tap to choose without scrolling up */}
          {sizeOptionName && sizeValues.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto px-4 pt-2.5 pb-1.5 scrollbar-hide border-b border-gray-100">
              <span className="shrink-0 text-[11px] font-semibold text-gray-500">{sizeOptionName}:</span>
              {sizeValues.map((val) => {
                const variantForOption = variants.find((v) =>
                  v.selectedOptions.some((o) => o.name === sizeOptionName && o.value === val),
                );
                const available = variantForOption?.availableForSale ?? false;
                const active = selectedSizeValue === val;
                return (
                  <button
                    key={val}
                    onClick={() => selectOption(sizeOptionName, val)}
                    disabled={!available}
                    className={`shrink-0 min-w-[2.4rem] px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all active:scale-95 ${
                      active
                        ? 'border-brand-orange bg-orange-50 text-brand-orange'
                        : 'border-gray-200 bg-white text-gray-700'
                    } ${!available ? 'opacity-35 cursor-not-allowed line-through' : ''}`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          )}

          {/* Price (bundle-aware) + CTA */}
          <div className="flex items-center gap-3 px-4 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400 truncate leading-none mb-0.5">
                {bundleQty > 1
                  ? `${bundleQty} unidades · ahorrás ${selectedBundle.off}%`
                  : selectedVariant?.selectedOptions?.map((o) => o.value).join(' · ')}
              </p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-lg font-extrabold text-navy leading-none">{stickyPrice}</p>
                {bundleQty > 1 && (
                  <p className="text-xs text-gray-400 line-through leading-none">
                    {fmt(String(unitAmount * bundleQty), currency)}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!isAvailable || isLoading}
              className="btn-primary px-6 py-3.5 text-sm shrink-0 shadow-lg shadow-brand-orange/30"
            >
              {isAvailable ? t.addToCart : t.outOfStock}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
