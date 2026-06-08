'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';

const QUICK: { label: string; href: string; emoji: string }[] = [
  { label: 'Ofertas',     href: '/cr/collections/cr-ofertas',        emoji: '🔥' },
  { label: 'Moda Mujer',  href: '/cr/collections/cr-moda-mujer',     emoji: '👗' },
  { label: 'Moda Hombre', href: '/cr/collections/cr-moda-hombre',    emoji: '👔' },
  { label: 'Tecnología',  href: '/cr/collections/cr-tecnologia',     emoji: '📱' },
  { label: 'Zapatos H',   href: '/cr/collections/cr-calzado-hombre', emoji: '👟' },
  { label: 'Zapatos M',   href: '/cr/collections/cr-calzado-mujer',  emoji: '👠' },
  { label: 'Relojes H',   href: '/cr/collections/cr-relojes-hombre', emoji: '⌚' },
  { label: 'Relojes M',   href: '/cr/collections/cr-relojes-mujer',  emoji: '⌚' },
  { label: 'Joyería',     href: '/cr/collections/cr-joyeria',        emoji: '💍' },
  { label: 'Hogar',       href: '/cr/collections/cr-hogar',          emoji: '🏠' },
  { label: 'Mascotas',    href: '/cr/collections/cr-mascotas',       emoji: '🐾' },
  { label: 'BBQ',         href: '/cr/collections/cr-parrillas',      emoji: '🍖' },
  { label: 'Fitness',     href: '/cr/collections/cr-deportes',       emoji: '💪' },
  { label: 'Automóvil',   href: '/cr/collections/cr-auto',           emoji: '🚗' },
  { label: 'Belleza',     href: '/cr/collections/cr-belleza',        emoji: '💄' },
];

function Item({ c }: { c: (typeof QUICK)[number] }) {
  return (
    <Link
      href={c.href}
      className="flex flex-col items-center gap-1 flex-shrink-0 w-[58px] active:scale-95 transition-transform"
    >
      <span className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-center text-xl shadow-sm">
        {c.emoji}
      </span>
      <span className="text-[10px] font-medium text-navy text-center leading-tight whitespace-nowrap">
        {c.label}
      </span>
    </Link>
  );
}

export default function QuickCategories() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // respeta usuarios con movimiento reducido
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let paused = false;
    let resumeT: ReturnType<typeof setTimeout>;
    let acc = el.scrollLeft;

    const pause = () => {
      paused = true;
      clearTimeout(resumeT);
      resumeT = setTimeout(() => { paused = false; acc = el.scrollLeft; }, 2200);
    };
    // solo gestos del usuario pausan (no el auto-scroll)
    el.addEventListener('pointerdown', pause);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('wheel', pause, { passive: true });

    const id = setInterval(() => {
      if (paused || !el) { if (el) acc = el.scrollLeft; return; }
      const half = el.scrollWidth / 2;
      acc += 0.4; // velocidad lenta
      if (acc >= half) acc -= half;
      el.scrollLeft = acc;
    }, 16);

    return () => {
      clearInterval(id);
      clearTimeout(resumeT);
      el.removeEventListener('pointerdown', pause);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('wheel', pause);
    };
  }, []);

  return (
    <section className="bg-white md:hidden py-2.5">
      <div
        ref={ref}
        className="flex gap-4 px-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {QUICK.map((c) => (
          <Item key={c.href} c={c} />
        ))}
        {/* copia para loop continuo (auto-scroll infinito) */}
        {QUICK.map((c) => (
          <Item key={c.href + '-dup'} c={c} />
        ))}
      </div>
    </section>
  );
}
