import Link from 'next/link';
import { Flame, Sparkles, TrendingUp, Truck, ShieldCheck, Lock } from 'lucide-react';

const ITEMS = [
  { label: 'Ofertas',      href: '/cr/collections/cr-ofertas',    Icon: Flame,       color: 'text-red-500 bg-red-50' },
  { label: 'Nuevos',       href: '/cr/collections/cr-ofertas',    Icon: Sparkles,    color: 'text-emerald-500 bg-emerald-50' },
  { label: 'Más vendidos', href: '/cr/collections/cr-tecnologia', Icon: TrendingUp,  color: 'text-brand-orange bg-orange-50' },
  { label: 'Envío gratis', href: '/cr/collections/cr-ofertas',    Icon: Truck,       color: 'text-blue-500 bg-blue-50' },
  { label: 'Garantía',     href: '/cr/collections/cr-tecnologia', Icon: ShieldCheck, color: 'text-violet-500 bg-violet-50' },
  { label: 'Pago seguro',  href: '/cr/collections/cr-tecnologia', Icon: Lock,        color: 'text-teal-500 bg-teal-50' },
];

export default function QuickAccess() {
  return (
    <section className="md:hidden bg-white px-3 py-3 border-b border-gray-100">
      <div className="grid grid-cols-6 gap-1.5">
        {ITEMS.map(({ label, href, Icon, color }) => (
          <Link key={label} href={href} className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <span className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </span>
            <span className="text-[9.5px] font-medium text-navy text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
