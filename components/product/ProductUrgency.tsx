'use client';

import { useEffect, useState } from 'react';
import { Eye, Flame, Truck, ShieldCheck, Smartphone } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';

/** Urgency strip: live viewers, low stock, and a real estimated delivery window. */
export default function ProductUrgency() {
  const { lang } = useLang();
  const { isCR } = useMarket();
  const es = lang === 'es';
  const [viewers, setViewers] = useState(0);

  // Stable-ish "people viewing" that drifts a little (social proof)
  useEffect(() => {
    setViewers(18 + Math.floor(Math.random() * 22));
    const id = setInterval(() => {
      setViewers((v) => Math.max(12, Math.min(48, v + (Math.random() > 0.5 ? 1 : -1))));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Delivery window: today + 7 to today + 14 days
  const fmt = (d: Date) =>
    d.toLocaleDateString(es ? 'es-CR' : 'en-US', { day: 'numeric', month: 'short' });
  const from = new Date(); from.setDate(from.getDate() + (isCR ? 1 : 7));
  const to = new Date(); to.setDate(to.getDate() + (isCR ? 3 : 14));

  return (
    <div className="space-y-3">
      {/* Live viewers + low stock */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full">
          <Flame size={13} /> {es ? '¡Producto viral! Casi agotado' : 'Viral product! Almost sold out'}
        </span>
        {viewers > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
            <Eye size={13} /> {viewers} {es ? 'personas viéndolo ahora' : 'people viewing now'}
          </span>
        )}
      </div>

      {/* Delivery estimate */}
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
        <Truck size={18} className="text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-emerald-800">
            {isCR ? 'Envío a todo Costa Rica' : es ? 'Envío rápido desde USA' : 'Fast shipping from USA'}
          </p>
          <p className="text-emerald-700">
            {es ? 'Pedí hoy y recibí entre ' : 'Order today, get it between '}
            <strong>{fmt(from)}</strong> {es ? 'y' : 'and'} <strong>{fmt(to)}</strong>
          </p>
        </div>
      </div>

      {/* CR: payment trust — SINPE is a strong local trust signal */}
      {isCR && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Smartphone size={14} className="text-brand-orange shrink-0" />
          <span>
            Pagás con <strong className="text-navy">SINPE Móvil</strong> o tarjeta · Te confirmamos por WhatsApp
          </span>
        </div>
      )}

      {/* Guarantee */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <ShieldCheck size={14} className="text-brand-orange" />
        {isCR
          ? 'Garantía de 30 días o te devolvemos tu plata · Compra protegida'
          : es
          ? 'Garantía de devolución de 30 días · Pago 100% seguro'
          : '30-day money-back guarantee · 100% secure payment'}
      </div>
    </div>
  );
}
