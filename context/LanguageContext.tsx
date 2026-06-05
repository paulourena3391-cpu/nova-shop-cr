'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

type Lang = 'en' | 'es';

type Translations = {
  announcement: string;
  searchPlaceholder: string;
  cart: string;
  cartEmpty: string;
  cartEmptyDesc: string;
  continueShopping: string;
  orderSummary: string;
  subtotal: string;
  taxes: string;
  total: string;
  checkout: string;
  remove: string;
  qty: string;
  addToCart: string;
  outOfStock: string;
  buyNow: string;
  description: string;
  specifications: string;
  relatedProducts: string;
  collections: string;
  home: string;
  search: string;
  searchResults: string;
  noResults: string;
  filters: string;
  sort: string;
  priceAsc: string;
  priceDesc: string;
  newest: string;
  bestSelling: string;
  minPrice: string;
  maxPrice: string;
  applyFilters: string;
  clearFilters: string;
  showingResults: string;
  dealsOfDay: string;
  endsIn: string;
  newsletter: string;
  newsletterDesc: string;
  yourEmail: string;
  subscribe: string;
  trustShipping: string;
  trustShippingDesc: string;
  trustPayments: string;
  trustPaymentsDesc: string;
  trustReturns: string;
  trustReturnsDesc: string;
  trustSupport: string;
  trustSupportDesc: string;
  shopByCategory: string;
  electronics: string;
  beauty: string;
  homeLiving: string;
  sports: string;
  trending: string;
  viewAll: string;
  shopNow: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  securePay: string;
  fastShipping: string;
  hours: string;
  minutes: string;
  seconds: string;
  days: string;
};

const en: Translations = {
  announcement: 'Free shipping on orders over $50 | Use code NOVA10 for 10% off your first order',
  searchPlaceholder: 'Search products...',
  cart: 'Cart',
  cartEmpty: 'Your cart is empty',
  cartEmptyDesc: 'Looks like you haven\'t added anything yet.',
  continueShopping: 'Continue Shopping',
  orderSummary: 'Order Summary',
  subtotal: 'Subtotal',
  taxes: 'Taxes',
  total: 'Total',
  checkout: 'Proceed to Checkout',
  remove: 'Remove',
  qty: 'Qty',
  addToCart: 'Add to Cart',
  outOfStock: 'Out of Stock',
  buyNow: 'Buy Now',
  description: 'Description',
  specifications: 'Specifications',
  relatedProducts: 'You may also like',
  collections: 'Collections',
  home: 'Home',
  search: 'Search',
  searchResults: 'Search Results',
  noResults: 'No products found',
  filters: 'Filters',
  sort: 'Sort by',
  priceAsc: 'Price: Low to High',
  priceDesc: 'Price: High to Low',
  newest: 'Newest',
  bestSelling: 'Best Selling',
  minPrice: 'Min Price',
  maxPrice: 'Max Price',
  applyFilters: 'Apply Filters',
  clearFilters: 'Clear Filters',
  showingResults: 'Showing results for',
  dealsOfDay: "Today's Deals",
  endsIn: 'Ends in',
  newsletter: 'Stay in the Loop',
  newsletterDesc: 'Get exclusive deals, new arrivals, and insider tips delivered to your inbox.',
  yourEmail: 'Your email address',
  subscribe: 'Subscribe',
  trustShipping: 'Fast Shipping',
  trustShippingDesc: '2-3 day delivery nationwide',
  trustPayments: 'Secure Payments',
  trustPaymentsDesc: '256-bit SSL encryption',
  trustReturns: 'Easy Returns',
  trustReturnsDesc: '30-day hassle-free returns',
  trustSupport: '24/7 Support',
  trustSupportDesc: 'Always here to help you',
  shopByCategory: 'Shop by Category',
  electronics: 'Electronics',
  beauty: 'Beauty',
  homeLiving: 'Home & Living',
  sports: 'Sports',
  trending: 'Trending',
  viewAll: 'View All',
  shopNow: 'Shop Now',
  heroBadge: 'New Collection 2026',
  heroTitle: 'Discover the Future of Shopping',
  heroSubtitle: 'Premium products, unbeatable prices. Delivered to your door in 2-3 days.',
  securePay: 'Secure Payment',
  fastShipping: 'Fast Delivery',
  hours: 'h',
  minutes: 'm',
  seconds: 's',
  days: 'd',
};

const es: Translations = {
  announcement: 'Envíos gratis en pedidos +$50 | Usá NOVA10 para 10% off en tu primer pedido',
  searchPlaceholder: 'Buscar productos...',
  cart: 'Carrito',
  cartEmpty: 'Tu carrito está vacío',
  cartEmptyDesc: 'Parece que aún no agregaste nada.',
  continueShopping: 'Seguir comprando',
  orderSummary: 'Resumen del pedido',
  subtotal: 'Subtotal',
  taxes: 'Impuestos',
  total: 'Total',
  checkout: 'Proceder al pago',
  remove: 'Eliminar',
  qty: 'Cant.',
  addToCart: 'Agregar al carrito',
  outOfStock: 'Sin stock',
  buyNow: 'Comprar ahora',
  description: 'Descripción',
  specifications: 'Especificaciones',
  relatedProducts: 'También te puede gustar',
  collections: 'Colecciones',
  home: 'Inicio',
  search: 'Buscar',
  searchResults: 'Resultados de búsqueda',
  noResults: 'No se encontraron productos',
  filters: 'Filtros',
  sort: 'Ordenar por',
  priceAsc: 'Precio: Menor a Mayor',
  priceDesc: 'Precio: Mayor a Menor',
  newest: 'Más recientes',
  bestSelling: 'Más vendidos',
  minPrice: 'Precio mínimo',
  maxPrice: 'Precio máximo',
  applyFilters: 'Aplicar filtros',
  clearFilters: 'Limpiar filtros',
  showingResults: 'Resultados para',
  dealsOfDay: 'Ofertas del día',
  endsIn: 'Termina en',
  newsletter: 'Mantente al día',
  newsletterDesc: 'Recibí ofertas exclusivas, novedades y consejos directo en tu correo.',
  yourEmail: 'Tu correo electrónico',
  subscribe: 'Suscribirme',
  trustShipping: 'Envíos rápidos',
  trustShippingDesc: 'Entrega en 2-3 días a todo el país',
  trustPayments: 'Pagos seguros',
  trustPaymentsDesc: 'Encriptación SSL de 256 bits',
  trustReturns: 'Devoluciones fáciles',
  trustReturnsDesc: 'Devoluciones sin problema en 30 días',
  trustSupport: 'Soporte 24/7',
  trustSupportDesc: 'Siempre listos para ayudarte',
  shopByCategory: 'Comprar por categoría',
  electronics: 'Electrónica',
  beauty: 'Belleza',
  homeLiving: 'Hogar',
  sports: 'Deportes',
  trending: 'Tendencias',
  viewAll: 'Ver todo',
  shopNow: 'Comprar ahora',
  heroBadge: 'Nueva Colección 2026',
  heroTitle: 'Descubrí el Futuro del Shopping',
  heroSubtitle: 'Productos premium, precios imbatibles. A tu puerta en 2-3 días.',
  securePay: 'Pago seguro',
  fastShipping: 'Entrega rápida',
  hours: 'h',
  minutes: 'm',
  seconds: 's',
  days: 'd',
};

type LanguageContextType = {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCR = pathname.startsWith('/cr');

  // In the CR market, language is always Spanish; in the US market the user can toggle.
  const [langOverride, setLangOverride] = useState<Lang>('en');
  const lang: Lang = isCR ? 'es' : langOverride;

  const toggleLang = useCallback(() => {
    if (!isCR) setLangOverride((prev) => (prev === 'es' ? 'en' : 'es'));
  }, [isCR]);

  const t = lang === 'es' ? es : en;

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}
