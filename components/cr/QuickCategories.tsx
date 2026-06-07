import Link from 'next/link';

const QUICK: { label: string; href: string; emoji: string }[] = [
  { label: 'Ofertas',     href: '/cr/collections/cr-ofertas',        emoji: '🔥' },
  { label: 'Tecnología',  href: '/cr/collections/cr-tecnologia',     emoji: '📱' },
  { label: 'Hogar',       href: '/cr/collections/cr-hogar',          emoji: '🏠' },
  { label: 'Zapatos H',   href: '/cr/collections/cr-calzado-hombre', emoji: '👟' },
  { label: 'Zapatos M',   href: '/cr/collections/cr-calzado-mujer',  emoji: '👠' },
  { label: 'Relojes H',   href: '/cr/collections/cr-relojes-hombre', emoji: '⌚' },
  { label: 'Relojes M',   href: '/cr/collections/cr-relojes-mujer',  emoji: '⌚' },
  { label: 'Joyería',     href: '/cr/collections/cr-joyeria',        emoji: '💍' },
  { label: 'Mascotas',    href: '/cr/collections/cr-mascotas',       emoji: '🐾' },
  { label: 'BBQ',         href: '/cr/collections/cr-parrillas',      emoji: '🍖' },
  { label: 'Fitness',     href: '/cr/collections/cr-deportes',       emoji: '💪' },
  { label: 'Automóvil',   href: '/cr/collections/cr-auto',           emoji: '🚗' },
  { label: 'Belleza',     href: '/cr/collections/cr-belleza',        emoji: '💄' },
];

export default function QuickCategories() {
  return (
    <section className="bg-white md:hidden">
      <div
        className="flex gap-3 overflow-x-auto px-3 py-2.5 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {QUICK.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex flex-col items-center gap-1 flex-shrink-0 w-[54px] active:scale-95 transition-transform"
          >
            <span className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-center text-xl shadow-sm">
              {c.emoji}
            </span>
            <span className="text-[10px] font-medium text-navy text-center leading-tight whitespace-nowrap">
              {c.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
