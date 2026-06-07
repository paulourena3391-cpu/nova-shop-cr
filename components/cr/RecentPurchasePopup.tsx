'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';

const NAMES = ['Valeria', 'José', 'María', 'Andrés', 'Carolina', 'Diego', 'Daniela', 'Mauricio', 'Gabriela', 'Esteban', 'Natalia', 'Kevin', 'Priscila', 'Bryan', 'Tatiana'];
const CANTONES = ['Curridabat', 'Heredia', 'Alajuela', 'Cartago', 'Desamparados', 'Escazú', 'Liberia', 'Pérez Zeledón', 'San Carlos', 'Tibás', 'Moravia', 'Pococí', 'Grecia', 'Santa Ana'];
const PRODUCTS = ['un Reloj Inteligente', 'unos Audífonos Bluetooth', 'unos Tenis Deportivos', 'un Power Bank', 'una Parrilla BBQ', 'un Vestido', 'una Cámara para Auto', 'un Set de Cocina', 'una Pulsera Inteligente', 'unas Sandalias', 'un Cargador Inalámbrico', 'un Organizador de Hogar'];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export default function RecentPurchasePopup() {
  const [data, setData] = useState<{ name: string; canton: string; product: string; mins: number } | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (closed) return;
    let visTimer: ReturnType<typeof setTimeout>;
    function show() {
      setData({ name: pick(NAMES), canton: pick(CANTONES), product: pick(PRODUCTS), mins: 2 + Math.floor(Math.random() * 25) });
      visTimer = setTimeout(() => setData(null), 5200);
    }
    const first = setTimeout(show, 4000);
    const loop = setInterval(show, 14000);
    return () => { clearTimeout(first); clearTimeout(visTimer); clearInterval(loop); };
  }, [closed]);

  if (closed || !data) return null;

  return (
    <div className="fixed left-3 bottom-20 md:bottom-5 z-40 max-w-[290px] animate-slide-up">
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-gray-100 pl-3 pr-8 py-2.5 relative">
        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={18} className="text-brand-orange" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] text-navy leading-snug">
            <span className="font-bold">{data.name}</span> de {data.canton} compró {data.product}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Hace {data.mins} min • Compra verificada
          </p>
        </div>
        <button
          onClick={() => setClosed(true)}
          className="absolute top-1.5 right-1.5 text-gray-300 hover:text-gray-500"
          aria-label="Cerrar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
