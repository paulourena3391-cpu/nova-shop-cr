'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';
import { formatPrice, formatPriceCR } from '@/lib/shopify';

export default function CartView() {
  const { cart, cartLines, updateItem, removeItem, removeItem: removeCartItem, isLoading } = useCart();
  const { t, lang } = useLang();
  const { isCR, basePath } = useMarket();
  const fmt = isCR ? formatPriceCR : formatPrice;
  const home = basePath || '/';

  async function handleCheckout() {
    if (!cart) return;
    // Remove any unavailable lines before sending user to Shopify checkout
    const unavailableIds = cart.lines.edges
      .filter((e) => !e.node.merchandise.availableForSale || e.node.quantity === 0)
      .map((e) => e.node.id);
    for (const id of unavailableIds) {
      await removeCartItem(id);
    }
    window.location.href = cart.checkoutUrl;
  }

  if (cartLines.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={72} className="text-gray-200 mx-auto mb-6" />
        <h1 className="font-display text-3xl text-navy mb-3">{t.cartEmpty}</h1>
        <p className="text-gray-500 mb-8">{t.cartEmptyDesc}</p>
        <Link href={home} className="btn-primary text-base px-8 py-4">
          {t.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href={home}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-orange transition-colors text-sm mb-8"
      >
        <ArrowLeft size={16} />
        {t.continueShopping}
      </Link>

      <h1 className="font-display text-4xl text-navy mb-8">
        {t.cart}
        <span className="text-lg font-sans font-normal text-gray-400 ml-3">
          ({cart?.totalQuantity} {lang === 'es' ? 'items' : 'items'})
        </span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Cart items */}
        <div className="lg:col-span-2 min-w-0">
          <div className="space-y-0 divide-y divide-gray-100 border-t border-gray-100">
            {cartLines.map((line) => (
              <div key={line.id} className="flex gap-5 py-6">
                {/* Image */}
                <Link
                  href={`${basePath}/products/${line.merchandise.product.handle}`}
                  className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50"
                >
                  {line.merchandise.image ? (
                    <Image
                      src={line.merchandise.image.url}
                      alt={line.merchandise.image.altText ?? line.merchandise.product.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <ShoppingBag size={32} />
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`${basePath}/products/${line.merchandise.product.handle}`}
                    className="font-semibold text-navy hover:text-brand-orange transition-colors"
                  >
                    {line.merchandise.product.title}
                  </Link>
                  {line.merchandise.title !== 'Default Title' && (
                    <p className="text-sm text-gray-500 mt-0.5">{line.merchandise.title}</p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateItem(line.id, line.quantity - 1)}
                        disabled={isLoading}
                        className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-colors disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-navy text-lg w-8 text-center tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(line.id, line.quantity + 1)}
                        disabled={isLoading}
                        className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-colors disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Line price */}
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-navy text-lg">
                        {fmt(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                      </span>
                      <button
                        onClick={() => removeItem(line.id)}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 rounded-lg hover:bg-red-50"
                        aria-label={`${t.remove} ${line.merchandise.product.title}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue shopping → back to the market home (avoids 404) */}
          <Link
            href={home}
            className="inline-flex items-center gap-2 text-brand-orange hover:text-brand-orange-hover font-semibold text-sm mt-4 transition-colors"
          >
            <ArrowLeft size={16} />
            {t.continueShopping}
          </Link>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1 min-w-0">
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-24 space-y-5">
            <h2 className="font-display text-2xl text-navy">{t.orderSummary}</h2>

            {/* Line totals */}
            <div className="space-y-3 text-sm">
              {cartLines.map((line) => (
                <div key={line.id} className="flex justify-between text-gray-600">
                  <span className="truncate mr-2 min-w-0">
                    {line.merchandise.product.title} × {line.quantity}
                  </span>
                  <span className="flex-shrink-0 font-medium">
                    {fmt(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t.subtotal}</span>
                <span className="font-semibold">
                  {cart && fmt(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                </span>
              </div>
              {cart?.cost.totalTaxAmount && (
                <div className="flex justify-between text-gray-600">
                  <span>{t.taxes}</span>
                  <span className="font-semibold">
                    {fmt(cart.cost.totalTaxAmount.amount, cart.cost.totalTaxAmount.currencyCode)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-navy font-bold text-lg border-t border-gray-200 pt-3">
                <span>{t.total}</span>
                <span>
                  {cart && fmt(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}
                </span>
              </div>
            </div>

            {/* Checkout button — cleans unavailable lines then redirects to Shopify */}
            {cart && (
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="btn-primary w-full text-center text-base py-4 shadow-lg shadow-brand-orange/30 disabled:opacity-50"
              >
                {t.checkout} →
              </button>
            )}

            {/* Trust micro-badges */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
                {lang === 'es' ? 'Pago 100% seguro con encriptación SSL' : '100% secure checkout with SSL encryption'}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Truck size={14} className="text-blue-500 flex-shrink-0" />
                {lang === 'es' ? 'Envío estimado: 2-3 días hábiles' : 'Estimated shipping: 2-3 business days'}
              </div>
            </div>

            {/* Accepted payment icons */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-400">{lang === 'es' ? 'Aceptamos:' : 'We accept:'}</span>
              {['Visa', 'MC', 'AMEX', 'PayPal'].map((m) => (
                <span key={m} className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-medium text-gray-600">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
