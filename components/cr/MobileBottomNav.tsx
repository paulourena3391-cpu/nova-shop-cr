'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, ShoppingCart, User, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const CATEGORIES: { label: string; href: string; emoji: string }[] = [
  { label: 'Ofertas',        href: '/cr/collections/cr-ofertas',        emoji: '🔥' },
  { label: 'Tecnología',     href: '/cr/collections/cr-tecnologia',     emoji: '📱' },
  { label: 'Moda Mujer',     href: '/cr/collections/cr-moda-mujer',     emoji: '👗' },
  { label: 'Moda Hombre',    href: '/cr/collections/cr-moda-hombre',    emoji: '👔' },
  { label: 'Zapatos Hombre', href: '/cr/collections/cr-calzado-hombre', emoji: '👟' },
  { label: 'Zapatos Mujer',  href: '/cr/collections/cr-calzado-mujer',  emoji: '👠' },
  { label: 'Relojes Hombre', href: '/cr/collections/cr-relojes-hombre', emoji: '⌚' },
  { label: 'Relojes Mujer',  href: '/cr/collections/cr-relojes-mujer',  emoji: '⌚' },
  { label: 'Joyería',        href: '/cr/collections/cr-joyeria',        emoji: '💍' },
  { label: 'Mascotas',       href: '/cr/collections/cr-mascotas',       emoji: '🐾' },
  { label: 'Parrillas BBQ',  href: '/cr/collections/cr-parrillas',      emoji: '🍖' },
  { label: 'Hogar',          href: '/cr/collections/cr-hogar',          emoji: '🏠' },
  { label: 'Fitness',        href: '/cr/collections/cr-deportes',       emoji: '💪' },
  { label: 'Automóvil',      href: '/cr/collections/cr-auto',           emoji: '🚗' },
  { label: 'Belleza',        href: '/cr/collections/cr-belleza',        emoji: '💄' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCart();
  const [catsOpen, setCatsOpen] = useState(false);

  const isHome = pathname === '/cr';

  const itemCls = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors ${
      active ? 'text-brand-orange' : 'text-gray-500'
    }`;

  return (
    <>
      {/* Category bottom sheet */}
      {catsOpen && (
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setCatsOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[78vh] overflow-y-auto animate-slide-up pb-24">
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-lg font-bold text-navy">Todas las categorías</h3>
              <button
                onClick={() => setCatsOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 p-5">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  onClick={() => setCatsOpen(false)}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 py-4 px-2 text-center active:scale-95 transition-transform"
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="text-[11px] font-semibold text-navy leading-tight">{c.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fixed bottom bar — mobile only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 h-16 flex items-stretch shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <Link href="/cr" className={itemCls(isHome)}>
          <Home size={22} />
          <span>Inicio</span>
        </Link>

        <button onClick={() => setCatsOpen(true)} className={itemCls(catsOpen)}>
          <LayoutGrid size={22} />
          <span>Categorías</span>
        </button>

        <Link href="/cr/search" className={itemCls(pathname.startsWith('/cr/search'))}>
          <Search size={22} />
          <span>Buscar</span>
        </Link>

        <button onClick={toggleCart} className={itemCls(false)}>
          <span className="relative">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-orange text-white text-[9px] font-bold min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </span>
          <span>Carrito</span>
        </button>

        <Link href="/track" className={itemCls(pathname.startsWith('/track'))}>
          <User size={22} />
          <span>Cuenta</span>
        </Link>
      </nav>
    </>
  );
}
