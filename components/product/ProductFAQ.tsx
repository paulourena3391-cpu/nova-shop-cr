'use client';

// Objection-handling FAQ for cold TikTok traffic (CR market only).
// Each question targets a specific purchase objection that kills conversions.

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: '¿Cómo puedo pagar?',
    a: 'Aceptamos SINPE Móvil y tarjeta de crédito/débito. Si pagás por SINPE, te confirmamos el pago al instante por WhatsApp y despachamos tu pedido.',
  },
  {
    q: '¿Cuánto tarda en llegar mi pedido?',
    a: 'Enviamos a todo Costa Rica en aproximadamente 1 a 2 semanas (10 a 15 días). Apenas se despacha tu pedido te avisamos por WhatsApp y te damos el seguimiento.',
  },
  {
    q: '¿Y si no me sirve o no me gusta?',
    a: 'Tenés 30 días de garantía. Si el producto no es lo que esperabas, escribinos por WhatsApp y te devolvemos tu dinero. Cero riesgo para vos.',
  },
  {
    q: '¿Hacen envíos a todo el país?',
    a: 'Sí, llegamos a todas las provincias de Costa Rica: San José, Alajuela, Cartago, Heredia, Guanacaste, Puntarenas y Limón.',
  },
  {
    q: '¿Es seguro comprar aquí?',
    a: 'Totalmente. Tu pago se procesa de forma segura y siempre podés escribirnos por WhatsApp antes, durante y después de tu compra. Somos una tienda real que responde.',
  },
  {
    q: '¿Tienen dudas con la talla o el producto?',
    a: 'Escribinos por WhatsApp y te asesoramos para que elijás bien antes de comprar. Queremos que recibas exactamente lo que necesitás.',
  },
];

export default function ProductFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mt-12 md:mt-16 px-4 md:px-0">
      <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tightest mb-6 inline-flex items-center gap-3">
        <span className="w-1.5 h-7 bg-brand-orange rounded-full" />
        Preguntas frecuentes
      </h2>

      <div className="space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.q}
              className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-card"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left active:bg-gray-50 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3 font-semibold text-navy text-sm md:text-base">
                  <HelpCircle size={18} className="text-brand-orange shrink-0" />
                  {f.q}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-premium ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 pl-14 text-sm text-gray-600 leading-relaxed">
                    {f.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
