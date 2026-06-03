'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ChevronRight, Mail, MessageCircle, MapPin, CheckCircle } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function ContactPage() {
  const { lang, t } = useLang();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 900));
    setStatus('success');
  }

  const es = lang === 'es';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand-orange transition-colors">{t.home}</Link>
        <ChevronRight size={14} />
        <span className="text-navy font-medium">{es ? 'Contacto' : 'Contact'}</span>
      </nav>

      <header className="mb-10 animate-slide-up">
        <h1 className="font-display text-3xl md:text-5xl text-navy">{es ? 'Contacto' : 'Contact Us'}</h1>
        <p className="text-gray-500 text-lg mt-3">
          {es ? 'Estamos para ayudarte. Te respondemos en menos de 24 horas.' : "We're here to help. We reply within 24 hours."}
        </p>
        <div className="h-1 w-20 bg-brand-orange rounded-full mt-5" />
      </header>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { Icon: Mail, title: es ? 'Correo' : 'Email', value: 'soporte@novashop.cr' },
          { Icon: MessageCircle, title: 'WhatsApp', value: '+506 8888 8888' },
          { Icon: MapPin, title: es ? 'Ubicación' : 'Location', value: 'San José, Costa Rica' },
        ].map(({ Icon, title, value }) => (
          <div key={title} className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <Icon size={22} className="text-brand-orange mb-3" />
            <p className="font-semibold text-navy text-sm">{title}</p>
            <p className="text-gray-500 text-sm mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {status === 'success' ? (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-6 py-5 text-green-700 animate-slide-up">
          <CheckCircle size={24} />
          <span className="font-semibold">
            {es ? '¡Mensaje enviado! Te responderemos pronto.' : 'Message sent! We will reply soon.'}
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
          <div className="grid sm:grid-cols-2 gap-4">
            <input required placeholder={es ? 'Tu nombre' : 'Your name'} className="input-field" />
            <input required type="email" placeholder={es ? 'Tu correo' : 'Your email'} className="input-field" />
          </div>
          <input placeholder={es ? 'Asunto' : 'Subject'} className="input-field" />
          <textarea required rows={5} placeholder={es ? 'Tu mensaje...' : 'Your message...'} className="input-field resize-none" />
          <button type="submit" disabled={status === 'loading'} className="btn-primary px-8 py-3.5 disabled:opacity-70">
            {status === 'loading' && <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
            {es ? 'Enviar mensaje' : 'Send message'}
          </button>
        </form>
      )}
    </div>
  );
}
