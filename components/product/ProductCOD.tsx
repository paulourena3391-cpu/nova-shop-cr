'use client';

// "Pago contra entrega" — the trust-builder for cold Costa Rican traffic that
// doesn't pay upfront online. The customer fills their shipping data in a clean
// Dropi-style modal and, on submit, WhatsApp opens pre-filled with BOTH the
// product info and all the delivery data, sent straight to the merchant.
// No Shopify dependency — pure page + WhatsApp + Dropi (the long-term stack).

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Truck, Banknote } from 'lucide-react';

const WHATSAPP_NUMBER = '50661950239';

// Costa Rica: 7 provincias → 84 cantones (cascada real)
const CR: Record<string, string[]> = {
  'San José': [
    'San José', 'Escazú', 'Desamparados', 'Puriscal', 'Tarrazú', 'Aserrí', 'Mora',
    'Goicoechea', 'Santa Ana', 'Alajuelita', 'Vázquez de Coronado', 'Acosta', 'Tibás',
    'Moravia', 'Montes de Oca', 'Turrubares', 'Dota', 'Curridabat', 'Pérez Zeledón',
    'León Cortés Castro',
  ],
  'Alajuela': [
    'Alajuela', 'San Ramón', 'Grecia', 'San Mateo', 'Atenas', 'Naranjo', 'Palmares',
    'Poás', 'Orotina', 'San Carlos', 'Zarcero', 'Sarchí', 'Upala', 'Los Chiles',
    'Guatuso', 'Río Cuarto',
  ],
  'Cartago': [
    'Cartago', 'Paraíso', 'La Unión', 'Jiménez', 'Turrialba', 'Alvarado', 'Oreamuno',
    'El Guarco',
  ],
  'Heredia': [
    'Heredia', 'Barva', 'Santo Domingo', 'Santa Bárbara', 'San Rafael', 'San Isidro',
    'Belén', 'Flores', 'San Pablo', 'Sarapiquí',
  ],
  'Guanacaste': [
    'Liberia', 'Nicoya', 'Santa Cruz', 'Bagaces', 'Carrillo', 'Cañas', 'Abangares',
    'Tilarán', 'Nandayure', 'La Cruz', 'Hojancha',
  ],
  'Puntarenas': [
    'Puntarenas', 'Esparza', 'Buenos Aires', 'Montes de Oro', 'Osa', 'Quepos', 'Golfito',
    'Coto Brus', 'Parrita', 'Corredores', 'Garabito', 'Monteverde', 'Puerto Jiménez',
  ],
  'Limón': [
    'Limón', 'Pococí', 'Siquirres', 'Talamanca', 'Matina', 'Guácimo',
  ],
};

const PROVINCIAS = Object.keys(CR);

export default function ProductCOD({
  productTitle,
  variant,
  price,
  qty = 1,
  bundleOff = 0,
}: {
  productTitle: string;
  variant?: string;
  price: string;
  qty?: number;
  bundleOff?: number;
}) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [provincia, setProvincia] = useState('');
  const [canton, setCanton] = useState('');
  const [distrito, setDistrito] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Portal target: render the modal on document.body so it escapes the
  // framer-motion transformed wrappers on /cr (a transformed ancestor would
  // otherwise trap `position: fixed` and push the modal off-screen).
  useEffect(() => setMounted(true), []);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const phoneOk = /^\d{8}$/.test(telefono.replace(/\D/g, ''));
  const valid =
    nombre.trim() && phoneOk && provincia && canton && direccion.trim();

  function submit() {
    setTouched(true);
    if (!valid) return;

    const msg =
      `*NUEVO PEDIDO - Pago contra entrega*\n\n` +
      `*Producto:* ${productTitle}` +
      (variant ? `\nOpción: ${variant}` : '') +
      `\nCantidad: ${qty}${qty > 1 && bundleOff ? ` (combo -${bundleOff}%)` : ''}` +
      `\nTotal a pagar: ${price}\n\n` +
      `*CLIENTE*\n` +
      `Nombre: ${nombre.trim()} ${apellido.trim()}`.trimEnd() + `\n` +
      `Teléfono: ${telefono.replace(/\D/g, '')}\n` +
      (email.trim() ? `Email: ${email.trim()}\n` : '') +
      `\n*DIRECCIÓN DE ENTREGA*\n` +
      `Provincia: ${provincia}\n` +
      `Cantón: ${canton}\n` +
      (distrito.trim() ? `Distrito: ${distrito.trim()}\n` : '') +
      `Dirección y señas: ${direccion.trim()}\n\n` +
      `*Forma de pago: EFECTIVO contra entrega*`;

    const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(href, '_blank', 'noopener,noreferrer');
    setOpen(false);
  }

  const showErr = touched && !valid;
  const inputBase =
    'w-full rounded-xl border bg-white px-3.5 py-3 text-[15px] text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20';

  return (
    <div className="pt-1">
      {/* ── Trust-forward button ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full flex-col items-center gap-0.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-3.5 text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-emerald-600/40 active:translate-y-0 active:scale-[0.98]"
      >
        <span className="flex items-center gap-2 text-base font-bold">
          <Banknote size={20} aria-hidden />
          Pedí con pago contra entrega
        </span>
        <span className="text-[11px] font-medium text-emerald-50/90">
          No pagás ahora · Pagás en efectivo cuando te llega 📦
        </span>
      </button>

      {/* ── Modal (portaled to body to escape transformed ancestors) ── */}
      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-4 text-white">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold">Pago contra entrega</h3>
              <p className="mt-0.5 text-[13px] text-emerald-50/90">
                Llená tus datos y pagás en efectivo al recibir.
              </p>
            </div>

            {/* Trust strip */}
            <div className="flex items-center justify-around border-b border-gray-100 bg-gray-50 px-3 py-2.5 text-[11px] font-medium text-gray-600">
              <span className="flex items-center gap-1"><Banknote size={14} className="text-emerald-600" /> Pagás al recibir</span>
              <span className="flex items-center gap-1"><Truck size={14} className="text-blue-600" /> Envío 1-3 días</span>
              <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-purple-600" /> Compra segura</span>
            </div>

            {/* Form (scrollable) */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {/* Product recap */}
              <div className="rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm">
                <p className="font-semibold text-gray-900">{productTitle}</p>
                {variant && <p className="text-gray-500">{variant}</p>}
                <p className="text-gray-500">
                  Cantidad: {qty}{qty > 1 && bundleOff ? ` · combo -${bundleOff}%` : ''}
                </p>
                <p className="mt-0.5 font-bold text-emerald-700">{price}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Nombre *</label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className={`${inputBase} ${showErr && !nombre.trim() ? 'border-red-400' : 'border-gray-200'}`}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Apellido</label>
                  <input
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Tu apellido"
                    className={`${inputBase} border-gray-200`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Teléfono (WhatsApp) *</label>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium text-gray-600">
                    🇨🇷 +506
                  </span>
                  <input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    inputMode="numeric"
                    placeholder="8888 8888"
                    className={`${inputBase} flex-1 ${showErr && !phoneOk ? 'border-red-400' : 'border-gray-200'}`}
                  />
                </div>
                {showErr && !phoneOk && (
                  <p className="mt-1 text-xs text-red-500">Ingresá un número de 8 dígitos.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Provincia *</label>
                  <select
                    value={provincia}
                    onChange={(e) => { setProvincia(e.target.value); setCanton(''); }}
                    className={`${inputBase} ${showErr && !provincia ? 'border-red-400' : 'border-gray-200'}`}
                  >
                    <option value="">Seleccioná…</option>
                    {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Cantón *</label>
                  <select
                    value={canton}
                    onChange={(e) => setCanton(e.target.value)}
                    disabled={!provincia}
                    className={`${inputBase} disabled:bg-gray-100 disabled:text-gray-400 ${showErr && !canton ? 'border-red-400' : 'border-gray-200'}`}
                  >
                    <option value="">{provincia ? 'Seleccioná…' : 'Elegí provincia'}</option>
                    {(CR[provincia] || []).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Distrito</label>
                <input
                  value={distrito}
                  onChange={(e) => setDistrito(e.target.value)}
                  placeholder="Tu distrito"
                  className={`${inputBase} border-gray-200`}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Dirección exacta y señas *</label>
                <textarea
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  rows={2}
                  placeholder="Ej: 200m norte de la iglesia, casa portón verde…"
                  className={`${inputBase} resize-none ${showErr && !direccion.trim() ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Email (opcional)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="tucorreo@email.com"
                  className={`${inputBase} border-gray-200`}
                />
              </div>
            </div>

            {/* Footer / submit */}
            <div className="border-t border-gray-100 px-5 py-3.5">
              <button
                type="button"
                onClick={submit}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-base font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:bg-[#1ebe5b] active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Confirmar pedido por WhatsApp
              </button>
              <p className="mt-2 text-center text-[11px] text-gray-400">
                Te confirmamos por WhatsApp. Pagás en efectivo al recibir tu pedido.
              </p>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
