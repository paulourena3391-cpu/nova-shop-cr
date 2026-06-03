'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

const FAQS = [
  {
    qEs: '¿Cuánto tarda el envío?',
    qEn: 'How long does shipping take?',
    aEs: 'Los envíos a Costa Rica tardan de 7 a 14 días hábiles, y a Estados Unidos de 5 a 10 días. Despachamos desde bodegas en USA para mayor rapidez.',
    aEn: 'Shipping to Costa Rica takes 7-14 business days, and to the US 5-10 days. We ship from US warehouses for faster delivery.',
  },
  {
    qEs: '¿Qué métodos de pago aceptan?',
    qEn: 'What payment methods do you accept?',
    aEs: 'Aceptamos tarjetas Visa, Mastercard, American Express y PayPal. Todos los pagos están protegidos con encriptación SSL de 256 bits.',
    aEn: 'We accept Visa, Mastercard, American Express and PayPal. All payments are protected with 256-bit SSL encryption.',
  },
  {
    qEs: '¿Puedo devolver un producto?',
    qEn: 'Can I return a product?',
    aEs: 'Sí. Tenés 30 días desde la entrega para devolver cualquier producto sin uso. Mirá nuestra página de Devoluciones para más detalles.',
    aEn: 'Yes. You have 30 days from delivery to return any unused product. See our Returns page for details.',
  },
  {
    qEs: '¿El envío es gratis?',
    qEn: 'Is shipping free?',
    aEs: 'El envío es gratis en pedidos mayores a $50. Para pedidos menores, el costo se calcula en el checkout.',
    aEn: 'Shipping is free on orders over $50. For smaller orders, the cost is calculated at checkout.',
  },
  {
    qEs: '¿Cómo sigo mi pedido?',
    qEn: 'How do I track my order?',
    aEs: 'Recibirás un correo con el número de seguimiento al despachar tu pedido. También podés usar nuestra página de Seguimiento.',
    aEn: 'You will receive an email with your tracking number when your order ships. You can also use our Track Order page.',
  },
];

export default function HelpPage() {
  const { lang, t } = useLang();
  const [open, setOpen] = useState<number | null>(0);
  const es = lang === 'es';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand-orange transition-colors">{t.home}</Link>
        <ChevronRight size={14} />
        <span className="text-navy font-medium">{es ? 'Centro de ayuda' : 'Help Center'}</span>
      </nav>

      <header className="mb-10 animate-slide-up">
        <h1 className="font-display text-3xl md:text-5xl text-navy">
          {es ? 'Centro de ayuda' : 'Help Center'}
        </h1>
        <p className="text-gray-500 text-lg mt-3">
          {es ? 'Preguntas frecuentes y respuestas rápidas.' : 'Frequently asked questions and quick answers.'}
        </p>
        <div className="h-1 w-20 bg-brand-orange rounded-full mt-5" />
      </header>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-brand-orange/40">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left"
            >
              <span className="font-semibold text-navy">{es ? faq.qEs : faq.qEn}</span>
              <ChevronDown
                size={20}
                className={`text-brand-orange shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            <div className={`grid transition-all duration-300 ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-gray-600 leading-relaxed">{es ? faq.aEs : faq.aEn}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gray-50 border border-gray-100 rounded-xl p-6 text-center animate-slide-up">
        <p className="text-navy font-semibold mb-1">{es ? '¿No encontraste tu respuesta?' : "Didn't find your answer?"}</p>
        <p className="text-gray-500 text-sm mb-4">{es ? 'Nuestro equipo está listo para ayudarte.' : 'Our team is ready to help.'}</p>
        <Link href="/contact" className="btn-primary px-6 py-3 inline-flex">
          {es ? 'Contactanos' : 'Contact us'}
        </Link>
      </div>
    </div>
  );
}
