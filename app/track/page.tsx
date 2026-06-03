'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ChevronRight, Package, Search } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function TrackPage() {
  const { lang, t } = useLang();
  const [order, setOrder] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const es = lang === 'es';

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (order.trim()) setSubmitted(true);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand-orange transition-colors">{t.home}</Link>
        <ChevronRight size={14} />
        <span className="text-navy font-medium">{es ? 'Seguimiento' : 'Track Order'}</span>
      </nav>

      <div className="text-center mb-8 animate-slide-up">
        <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Package size={30} className="text-brand-orange" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-navy">
          {es ? 'Seguí tu pedido' : 'Track your order'}
        </h1>
        <p className="text-gray-500 mt-2">
          {es ? 'Ingresá tu número de pedido para ver el estado.' : 'Enter your order number to see its status.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 animate-slide-up">
        <input
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder={es ? 'Ej: #NOVA1024' : 'e.g. #NOVA1024'}
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary px-6 shrink-0">
          <Search size={18} />
          {es ? 'Buscar' : 'Track'}
        </button>
      </form>

      {submitted && (
        <div className="mt-8 bg-gray-50 border border-gray-100 rounded-xl p-6 animate-slide-up">
          <p className="text-sm text-gray-500 mb-4">
            {es ? 'Estado del pedido' : 'Order status'} <strong className="text-navy">{order}</strong>
          </p>
          <div className="space-y-4">
            {[
              { label: es ? 'Pedido confirmado' : 'Order confirmed', done: true },
              { label: es ? 'En preparación' : 'Preparing', done: true },
              { label: es ? 'Enviado' : 'Shipped', done: false },
              { label: es ? 'Entregado' : 'Delivered', done: false },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${step.done ? 'bg-brand-orange' : 'bg-gray-200'}`} />
                <span className={step.done ? 'text-navy font-medium' : 'text-gray-400'}>{step.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-5">
            {es
              ? '¿No encontrás tu pedido? Escribinos a soporte@novashop.cr'
              : "Can't find your order? Email us at soporte@novashop.cr"}
          </p>
        </div>
      )}
    </div>
  );
}
