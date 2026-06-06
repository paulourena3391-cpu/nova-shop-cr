'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';
import { formatPrice, formatPriceCR } from '@/lib/shopify';
import { ttqTrack } from '@/lib/tiktok';

export default function CartDrawer() {
  const { isOpen, closeCart, cartLines, cart, updateItem, removeItem, isLoading } = useCart();
  const { t, lang } = useLang();
  const { isCR, basePath } = useMarket();
  const fmt = isCR ? formatPriceCR : formatPrice;

  async function handleCheckout() {
    if (!cart) return;
    const unavailableIds = cart.lines.edges
      .filter((e) => !e.node.merchandise.availableForSale || e.node.quantity === 0)
      .map((e) => e.node.id);
    for (const id of unavailableIds) {
      await removeItem(id);
    }
    if (isCR) {
      ttqTrack('InitiateCheckout', {
        content_type: 'product',
        value: parseFloat(cart.cost.totalAmount.amount),
        currency: 'USD',
      });
    }
    window.location.href = cart.checkoutUrl;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-display text-xl text-navy">
            {t.cart}
            {cart && cart.totalQuantity > 0 && (
              <span className="ml-2 text-sm font-sans text-gray-500">
                ({cart.totalQuantity})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto py-4">
          {cartLines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <ShoppingBag size={56} className="text-gray-200" />
              <h3 className="font-display text-xl text-navy">{t.cartEmpty}</h3>
              <p className="text-gray-500 text-sm">{t.cartEmptyDesc}</p>
              <button onClick={closeCart} className="btn-primary mt-2">
                {t.continueShopping}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {cartLines.map((line) => (
                <li key={line.id} className="flex gap-4 px-4 py-4">
                  {/* Product image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                    {line.merchandise.image ? (
                      <Image
                        src={line.merchandise.image.url}
                        alt={line.merchandise.image.altText ?? line.merchandise.product.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag size={24} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`${basePath}/products/${line.merchandise.product.handle}`}
                      onClick={closeCart}
                      className="text-sm font-semibold text-navy hover:text-brand-orange transition-colors line-clamp-2"
                    >
                      {line.merchandise.product.title}
                    </Link>
                    {line.merchandise.title !== 'Default Title' && (
                      <p className="text-xs text-gray-500 mt-0.5">{line.merchandise.title}</p>
                    )}
                    <p className="text-sm font-bold text-navy mt-1">
                      {fmt(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateItem(line.id, line.quantity - 1)}
                        disabled={isLoading}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-colors disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{line.quantity}</span>
                      <button
                        onClick={() => updateItem(line.id, line.quantity + 1)}
                        disabled={isLoading}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-colors disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>

                      <button
                        onClick={() => removeItem(line.id)}
                        disabled={isLoading}
                        className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {t.remove}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer with totals */}
        {cart && cartLines.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-3">
            {/* CRO: bundle-progress incentive (raises AOV) */}
            {(() => {
              const totalQty = cartLines.reduce((s, l) => s + l.quantity, 0);
              if (totalQty >= 3) {
                return (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl px-3 py-2.5">
                    🎉 {lang === 'es' ? '¡Tenés 15% de descuento aplicado!' : 'You unlocked 15% off!'}
                  </div>
                );
              }
              const need = totalQty === 2 ? 1 : 2;
              const off = totalQty === 2 ? '15%' : '10%';
              return (
                <div className="bg-orange-50 border border-brand-orange/20 rounded-xl px-3 py-2.5">
                  <p className="text-sm text-navy font-semibold">
                    {lang === 'es'
                      ? `Agregá ${need} más y ahorrá ${off} 🔥`
                      : `Add ${need} more and save ${off} 🔥`}
                  </p>
                  <div className="mt-1.5 h-1.5 bg-orange-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-orange rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalQty / 3) * 100)}%` }} />
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t.subtotal}</span>
                <span className="font-semibold">
                  {fmt(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                </span>
              </div>
              {cart.cost.totalTaxAmount && (
                <div className="flex justify-between text-gray-600">
                  <span>{t.taxes}</span>
                  <span className="font-semibold">
                    {fmt(cart.cost.totalTaxAmount.amount, cart.cost.totalTaxAmount.currencyCode)}
                  </span>
                </div>
              )}
              {/* Bundle/automatic discount line — shown when total < subtotal */}
              {parseFloat(cart.cost.totalAmount.amount) < parseFloat(cart.cost.subtotalAmount.amount) && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{lang === 'es' ? '🎉 Descuento' : '🎉 Discount'}</span>
                  <span>
                    −{fmt(
                      String(parseFloat(cart.cost.subtotalAmount.amount) - parseFloat(cart.cost.totalAmount.amount)),
                      cart.cost.totalAmount.currencyCode,
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-navy font-bold text-base pt-2 border-t border-gray-100">
                <span>{t.total}</span>
                <span>
                  {fmt(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}
                </span>
              </div>
            </div>

            {/* Currency note — CR charges in USD (PayPal); colones shown as reference */}
            {isCR && (
              <p className="text-[11px] leading-snug text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                💳 Se cobra en dólares ({formatPrice(cart.cost.totalAmount.amount, 'USD')}).
                Tu banco lo convierte a colones automáticamente.
              </p>
            )}

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="btn-primary w-full text-center text-base py-4 disabled:opacity-50"
            >
              {t.checkout}
            </button>

            {/* CRO: trust + guarantee row */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 pt-1">
              <span className="inline-flex items-center gap-1">🔒 {lang === 'es' ? 'Pago seguro' : 'Secure checkout'}</span>
              <span className="inline-flex items-center gap-1">↩️ {lang === 'es' ? '30 días' : '30-day returns'}</span>
              <span className="inline-flex items-center gap-1">🚚 {lang === 'es' ? 'Envío gratis' : 'Free shipping'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 opacity-70">
              {['Visa', 'MC', 'AMEX', 'PayPal'].map((m) => (
                <span key={m} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-semibold">{m}</span>
              ))}
            </div>

            <Link
              href={`${basePath}/cart`}
              onClick={closeCart}
              className="block text-center text-sm text-gray-500 hover:text-navy transition-colors"
            >
              {t.cart} →
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
