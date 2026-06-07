'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';
import CartDrawer from './CartDrawer';

export default function Header() {
  const router = useRouter();
  const { itemCount, toggleCart } = useCart();
  const { lang, t } = useLang();
  const { isCR, basePath } = useMarket();

  const [menuOpen, setMenuOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  const navLinks = isCR
    ? [
        { label: 'Inicio',          href: '/cr' },
        { label: 'Ofertas',         href: '/cr/collections/cr-ofertas' },
        { label: 'Moda',            href: '/cr/collections/cr-moda-mujer', children: [
          { label: 'Mujer',  href: '/cr/collections/cr-moda-mujer' },
          { label: 'Hombre', href: '/cr/collections/cr-moda-hombre' },
        ] },
        { label: 'Tecnología',      href: '/cr/collections/cr-tecnologia' },
        { label: 'Zapatos',         href: '/cr/collections/cr-calzado', children: [
          { label: 'Todos',  href: '/cr/collections/cr-calzado' },
          { label: 'Hombre', href: '/cr/collections/cr-calzado-hombre' },
          { label: 'Mujer',  href: '/cr/collections/cr-calzado-mujer' },
        ] },
        { label: 'Relojes',         href: '/cr/collections/cr-relojes', children: [
          { label: 'Todos',  href: '/cr/collections/cr-relojes' },
          { label: 'Hombre', href: '/cr/collections/cr-relojes-hombre' },
          { label: 'Mujer',  href: '/cr/collections/cr-relojes-mujer' },
        ] },
        { label: 'Joyería',         href: '/cr/collections/cr-joyeria' },
        { label: 'Mascotas',        href: '/cr/collections/cr-mascotas' },
        { label: 'Parrillas y BBQ', href: '/cr/collections/cr-parrillas' },
        { label: 'Hogar',           href: '/cr/collections/cr-hogar' },
        { label: 'Fitness',         href: '/cr/collections/cr-deportes' },
        { label: 'Automóvil',       href: '/cr/collections/cr-auto' },
        { label: 'Belleza',         href: '/cr/collections/cr-belleza' },
      ]
    : [
        { label: t.home,                                          href: '/' },
        { label: lang === 'es' ? 'Ropa Mujer'  : "Women's",      href: '/collections/womens-clothing' },
        { label: lang === 'es' ? 'Hombre'      : 'Men',          href: '/collections/hombre' },
        { label: lang === 'es' ? 'Tecnología'  : 'Tech',         href: '/collections/consumer-electronics' },
        { label: lang === 'es' ? 'Belleza'     : 'Beauty',       href: '/collections/belleza-y-cuidado-personal' },
        { label: lang === 'es' ? 'Calzado'     : 'Footwear',     href: '/collections/calzado' },
        { label: lang === 'es' ? 'Hogar'       : 'Home',         href: '/collections/decoracion' },
        { label: lang === 'es' ? 'Fitness'     : 'Fitness',      href: '/collections/fitness' },
        { label: lang === 'es' ? 'Niños'       : 'Kids',         href: '/collections/ninos' },
        { label: lang === 'es' ? 'Mascotas'    : 'Pets',         href: '/collections/pets' },
      ];

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${basePath}/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchFocused(false);
    }
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        {/* Main header row */}
        <div className="bg-navy">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-16">
              {/* Logo */}
              <Link href={basePath || '/'} className="flex-shrink-0">
                <span className="font-display text-xl text-white">
                  Nova<span className="text-brand-orange">Shop</span>
                  <span className="text-brand-orange text-sm font-sans ml-1">CR</span>
                </span>
              </Link>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="flex-1 max-w-2xl mx-auto hidden md:flex"
              >
                <div
                  className={`flex w-full rounded-lg overflow-hidden border-2 transition-colors ${
                    searchFocused ? 'border-brand-orange' : 'border-transparent'
                  }`}
                >
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder={t.searchPlaceholder}
                    className="flex-1 px-4 py-2 text-sm text-gray-900 outline-none"
                    aria-label={t.searchPlaceholder}
                  />
                  <button
                    type="submit"
                    className="px-4 bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
                    aria-label={t.search}
                  >
                    <Search size={18} />
                  </button>
                </div>
              </form>

              {/* Right actions */}
              <div className="flex items-center gap-1 ml-auto md:ml-0">
                {/* Account → order tracking (no auth yet) */}
                <Link
                  href="/track"
                  className="p-2 text-white/80 hover:text-white transition-colors"
                  aria-label={lang === 'es' ? 'Seguimiento de pedido' : 'Track order'}
                >
                  <User size={22} />
                </Link>

                {/* Cart */}
                <button
                  onClick={toggleCart}
                  className="relative p-2 text-white/80 hover:text-white transition-colors"
                  aria-label={`${t.cart}: ${itemCount} items`}
                >
                  <ShoppingCart size={22} />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </button>

                {/* Mobile menu toggle */}
                <button
                  className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Menu"
                >
                  {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop nav bar */}
        <nav className="hidden md:block bg-navy-50 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center gap-1 h-10">
              {navLinks.map((link) => (
                'children' in link && link.children ? (
                  <li key={link.label} className="relative group h-full flex items-center">
                    <Link
                      href={link.href}
                      className="text-white/80 group-hover:text-white text-sm font-medium px-3 py-2 rounded group-hover:bg-white/10 transition-colors flex items-center gap-1"
                    >
                      {link.label}
                      <ChevronDown size={14} className="opacity-70" />
                    </Link>
                    <div className="absolute left-0 top-full hidden group-hover:block bg-navy border border-white/10 rounded-b-lg shadow-xl min-w-[170px] z-50 py-1">
                      {link.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-white text-sm font-medium px-3 py-2 rounded hover:bg-white/10 transition-colors block"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              ))}
            </ul>
          </div>
        </nav>

        {/* Mobile search bar */}
        <div className="md:hidden bg-navy px-4 pb-3">
          <form onSubmit={handleSearch} className="flex rounded-lg overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="flex-1 px-4 py-2 text-sm text-gray-900 outline-none"
            />
            <button
              type="submit"
              className="px-4 bg-brand-orange text-white"
              aria-label={t.search}
            >
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Mobile nav drawer */}
        {menuOpen && (
          <div className="md:hidden bg-navy border-t border-white/10 animate-slide-down">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                'children' in link && link.children ? (
                  <div key={link.label}>
                    <button
                      onClick={() => setOpenSub(openSub === link.label ? null : link.label)}
                      className="w-full flex items-center justify-between text-white/80 hover:text-white text-sm font-medium py-2 px-3 rounded hover:bg-white/10 transition-colors"
                    >
                      {link.label}
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${openSub === link.label ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openSub === link.label && (
                      <div className="pl-3 border-l border-white/10 ml-3 space-y-1 mt-1">
                        {link.children.map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            onClick={() => setMenuOpen(false)}
                            className="block text-white/70 hover:text-white text-sm py-2 px-3 rounded hover:bg-white/10 transition-colors"
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block text-white/80 hover:text-white text-sm font-medium py-2 px-3 rounded hover:bg-white/10 transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
