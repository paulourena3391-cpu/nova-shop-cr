'use client';

import { useEffect, useState, FormEvent } from 'react';
import { X, Gift, CheckCircle, Copy } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

const STORAGE_KEY = 'nova_exit_popup_seen';
const CODE = 'WELCOME10';

// Sales-recovery popup: captures email in exchange for a 10% code.
// Triggers on desktop exit-intent (mouse leaves top) OR mobile after 25s / deep scroll.
// Shows once per session. GPU-animated, dismissible.
export default function ExitIntentPopup() {
  const { lang } = useLang();
  const es = lang === 'es';
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      setOpen(true);
      sessionStorage.setItem(STORAGE_KEY, '1');
      cleanup();
    };

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) fire(); // mouse left through the top → leaving
    };
    const timer = setTimeout(fire, 30000); // mobile fallback: 30s

    window.addEventListener('mouseout', onMouseOut);
    function cleanup() {
      window.removeEventListener('mouseout', onMouseOut);
      clearTimeout(timer);
    }
    return cleanup;
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setDone(true);
    // (Email would be sent to a list/Klaviyo here)
  }

  function copyCode() {
    navigator.clipboard?.writeText(CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative bg-white rounded-3xl shadow-premium max-w-md w-full overflow-hidden animate-image-reveal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-gray-500 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header band */}
        <div className="bg-navy px-8 pt-9 pb-7 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-brand-orange/30 rounded-full blur-3xl" />
          <div className="relative w-14 h-14 mx-auto bg-brand-orange rounded-2xl flex items-center justify-center mb-3 shadow-cta">
            <Gift size={26} className="text-white" />
          </div>
          <h2 className="relative font-display text-2xl md:text-3xl text-white tracking-tightest">
            {es ? '¡Esperá! 10% de descuento' : 'Wait! Get 10% off'}
          </h2>
          <p className="relative text-white/70 text-sm mt-1.5">
            {es ? 'En tu primer pedido. Solo por hoy.' : 'On your first order. Today only.'}
          </p>
        </div>

        {/* Body */}
        <div className="p-7">
          {done ? (
            <div className="text-center">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
              <p className="font-semibold text-navy mb-1">
                {es ? '¡Listo! Usá este código:' : "You're in! Use this code:"}
              </p>
              <button
                onClick={copyCode}
                className="mt-2 inline-flex items-center gap-2 bg-brand-orange-light border-2 border-dashed border-brand-orange text-brand-orange font-bold text-lg px-5 py-2.5 rounded-xl"
              >
                {CODE} <Copy size={16} />
              </button>
              <p className="text-xs text-gray-400 mt-2">
                {copied ? (es ? '¡Copiado! ✓' : 'Copied! ✓') : (es ? 'Tocá para copiar' : 'Tap to copy')}
              </p>
            </div>
          ) : (
            <>
              <p className="text-center text-gray-500 text-sm mb-4">
                {es
                  ? 'Dejanos tu correo y te enviamos el código + ofertas exclusivas.'
                  : 'Drop your email and we’ll send your code + exclusive deals.'}
              </p>
              <form onSubmit={submit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={es ? 'tu@correo.com' : 'you@email.com'}
                  className="input-field text-center"
                />
                <button type="submit" className="btn-primary w-full py-3.5">
                  {es ? 'Quiero mi 10% 🎁' : 'Get my 10% 🎁'}
                </button>
              </form>
              <button
                onClick={() => setOpen(false)}
                className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors"
              >
                {es ? 'No gracias, prefiero pagar completo' : 'No thanks, I’ll pay full price'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
