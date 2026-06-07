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
    <section className="bg-white border-b border-gray-100 md:hidden">
      <div
        className="flex gap-4 overflow-x-auto px-4 py-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {QUICK.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[64px] active:scale-95 transition-transform"
          >
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-center text-2xl shadow-sm">
              {c.emoji}
            </span>
            <span className="text-[11px] font-medium text-navy text-center leading-tight whitespace-nowrap">
              {c.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
