'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/shopify';

export default function CartDrawer() {
  const { isOpen, closeCart, cartLines, cart, updateItem, removeItem, isLoading } = useCart();
  const { t } = useLang();

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
                      href={`/products/${line.merchandise.product.handle}`}
                      onClick={closeCart}
                      className="text-sm font-semibold text-navy hover:text-brand-orange transition-colors line-clamp-2"
                    >
                      {line.merchandise.product.title}
                    </Link>
                    {line.merchandise.title !== 'Default Title' && (
                      <p className="text-xs text-gray-500 mt-0.5">{line.merchandise.title}</p>
                    )}
                    <p className="text-sm font-bold text-navy mt-1">
                      {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
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
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t.subtotal}</span>
                <span className="font-semibold">
                  {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                </span>
              </div>
              {cart.cost.totalTaxAmount && (
                <div className="flex justify-between text-gray-600">
                  <span>{t.taxes}</span>
                  <span className="font-semibold">
                    {formatPrice(cart.cost.totalTaxAmount.amount, cart.cost.totalTaxAmount.currencyCode)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-navy font-bold text-base pt-2 border-t border-gray-100">
                <span>{t.total}</span>
                <span>
                  {formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}
                </span>
              </div>
            </div>

            <a
              href={cart.checkoutUrl}
              className="btn-primary w-full text-center text-base py-4"
            >
              {t.checkout}
            </a>

            <Link
              href="/cart"
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
