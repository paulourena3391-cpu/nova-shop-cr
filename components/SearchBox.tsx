'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Clock, TrendingUp, ArrowLeft } from 'lucide-react';

type Props = {
  basePath?: string;
  isCR?: boolean;
  placeholder?: string;
};

const CR_POPULAR = ['Reloj inteligente', 'Audífonos', 'Tenis hombre', 'Vestido', 'Power bank', 'Parrilla', 'Cámara de auto'];
const CR_CATS = [
  { label: 'Tecnología', href: '/cr/collections/cr-tecnologia' },
  { label: 'Relojes', href: '/cr/collections/cr-relojes' },
  { label: 'Zapatos', href: '/cr/collections/cr-calzado' },
  { label: 'Moda Mujer', href: '/cr/collections/cr-moda-mujer' },
  { label: 'Hogar', href: '/cr/collections/cr-hogar' },
  { label: 'Mascotas', href: '/cr/collections/cr-mascotas' },
];

export default function SearchBox({ basePath = '', isCR = false, placeholder = 'Buscar productos...' }: Props) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem('nsc_recent') || '[]');
      if (Array.isArray(r)) setRecent(r.slice(0, 6));
    } catch {}
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Bloquea el scroll del body cuando el overlay móvil está abierto
  useEffect(() => {
    if (open && typeof window !== 'undefined' && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => overlayInputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function go(term: string) {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recent.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6);
    setRecent(next);
    try { localStorage.setItem('nsc_recent', JSON.stringify(next)); } catch {}
    setOpen(false);
    setQ('');
    router.push(`${basePath}/search?q=${encodeURIComponent(t)}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    go(q);
  }

  function clearRecent() {
    setRecent([]);
    try { localStorage.removeItem('nsc_recent'); } catch {}
  }

  const Suggestions = () => (
    <>
      {recent.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <Clock size={13} /> Recientes
            </span>
            <button onClick={clearRecent} className="text-[11px] text-gray-400 hover:text-brand-orange">Borrar</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button key={r} onClick={() => go(r)} className="px-3 py-1.5 rounded-full bg-gray-100 text-sm text-navy hover:bg-gray-200 transition-colors">
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
          <TrendingUp size={13} /> Búsquedas populares
        </span>
        <div className="flex flex-wrap gap-2">
          {CR_POPULAR.map((p) => (
            <button key={p} onClick={() => go(p)} className="px-3 py-1.5 rounded-full bg-orange-50 text-sm text-brand-orange font-medium hover:bg-orange-100 transition-colors">
              {p}
            </button>
          ))}
        </div>
      </div>

      {isCR && (
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Categorías</span>
          <div className="grid grid-cols-2 gap-2">
            {CR_CATS.map((c) => (
              <Link key={c.href} href={c.href} onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium text-navy hover:border-brand-orange transition-colors">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div ref={wrapRef} className="relative w-full">
      <form onSubmit={onSubmit} className="flex w-full rounded-full overflow-hidden bg-white shadow-sm">
        <span className="flex items-center pl-4 text-gray-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 text-sm text-gray-900 outline-none bg-transparent min-w-0"
          aria-label="Buscar"
        />
        {q && (
          <button type="button" onClick={() => setQ('')} className="px-2 text-gray-400" aria-label="Limpiar">
            <X size={16} />
          </button>
        )}
        <button type="submit" className="px-5 bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-semibold transition-colors">
          Buscar
        </button>
      </form>

      {/* Desktop dropdown */}
      {open && (
        <div className="hidden md:block absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[70] p-4 max-h-[70vh] overflow-y-auto">
          <Suggestions />
        </div>
      )}

      {/* Mobile full-screen overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[80] bg-white flex flex-col animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-navy">
            <button onClick={() => setOpen(false)} className="text-white p-1" aria-label="Volver">
              <ArrowLeft size={22} />
            </button>
            <form onSubmit={onSubmit} className="flex-1 flex rounded-full overflow-hidden bg-white">
              <span className="flex items-center pl-3 text-gray-400"><Search size={18} /></span>
              <input
                ref={overlayInputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-3 py-2.5 text-sm text-gray-900 outline-none min-w-0"
                aria-label="Buscar"
              />
              {q && (
                <button type="button" onClick={() => setQ('')} className="px-3 text-gray-400" aria-label="Limpiar">
                  <X size={16} />
                </button>
              )}
            </form>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <Suggestions />
          </div>
        </div>
      )}
    </div>
  );
}
