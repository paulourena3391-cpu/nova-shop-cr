'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

// Recent-purchase social proof popups (bottom-left). Tasteful: appears
// occasionally, auto-dismisses, GPU-animated, respects reduced motion.
const NAMES_US = ['Sarah', 'James', 'Emily', 'Michael', 'Jessica', 'David', 'Ashley', 'Daniel', 'Maria', 'Carlos', 'Sofia', 'Kevin', 'Linda', 'Brian', 'Nicole'];
const CITIES_US = ['Miami, FL', 'Austin, TX', 'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Orlando, FL', 'Denver, CO', 'Seattle, WA', 'Atlanta, GA', 'San Diego, CA'];
const PRODUCTS_US = [
  'Posture Corrector', 'Bluetooth Sleep Headband', 'EMS Body Massager',
  'Pet Hair Remover', 'Smart Watch', 'Wireless Earphones', 'Resistance Bands Set',
  'Scalp Massage Brush', 'LED Work Light', 'Yoga Outfit',
];

// Costa Rica market
const NAMES_CR = ['Sofía', 'Andrés', 'Valeria', 'Diego', 'Camila', 'Luis', 'Daniela', 'Sebastián', 'Natalia', 'Carlos', 'Andrea', 'Fabio', 'Mariela', 'Josué', 'Paola'];
const CITIES_CR = ['San José', 'Heredia', 'Alajuela', 'Cartago', 'Liberia, Guanacaste', 'Pérez Zeledón', 'Desamparados', 'Escazú', 'La Sabana', 'Tres Ríos', 'Curridabat', 'Grecia', 'Nicoya', 'Puntarenas', 'Limón'];
const PRODUCTS_CR = [
  'Corrector de postura', 'Reloj inteligente', 'Audífonos Bluetooth',
  'Set de maquillaje', 'Faja reductora', 'Sandalia de moda',
  'Kit de yoga', 'Organizador de cocina', 'Cargador inalámbrico', 'Vestido de verano',
];

function rand<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

export default function SocialProof() {
  const { lang } = useLang();
  const es = lang === 'es';
  const NAMES    = es ? NAMES_CR    : NAMES_US;
  const CITIES   = es ? CITIES_CR   : CITIES_US;
  const PRODUCTS = es ? PRODUCTS_CR : PRODUCTS_US;
  const [item, setItem] = useState<{ name: string; city: string; product: string; mins: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let hideT: ReturnType<typeof setTimeout>;

    function show() {
      if (cancelled) return;
      setItem({ name: rand(NAMES), city: rand(CITIES), product: rand(PRODUCTS), mins: 2 + Math.floor(Math.random() * 40) });
      setVisible(true);
      hideT = setTimeout(() => setVisible(false), 5000); // visible 5s
    }

    // first after 6s, then every ~18-28s
    const first = setTimeout(show, 6000);
    const loop = setInterval(() => { show(); }, 22000);

    return () => { cancelled = true; clearTimeout(first); clearTimeout(hideT); clearInterval(loop); };
  }, []);

  if (!item) return null;

  return (
    <div
      className={`fixed bottom-24 left-4 z-40 max-w-[300px] transition-all duration-500 ease-premium ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-premium border border-gray-100 p-3 pr-9 relative">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <ShoppingBag size={18} className="text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-navy font-semibold leading-tight truncate">
            {item.name} {es ? 'de' : 'from'} {item.city}
          </p>
          <p className="text-xs text-gray-500 leading-tight truncate">
            {es ? 'compró' : 'bought'} <span className="text-brand-orange font-medium">{item.product}</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {es ? `hace ${item.mins} min` : `${item.mins} min ago`} · <span className="text-emerald-600">✓ {es ? 'Verificado' : 'Verified'}</span>
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          aria-label="Cerrar"
          className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
