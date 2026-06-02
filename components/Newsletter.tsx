'use client';

import { useState, FormEvent } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function Newsletter() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    // Simulate API call — replace with real endpoint
    await new Promise((r) => setTimeout(r, 800));
    setStatus('success');
    setEmail('');
  }

  return (
    <section className="py-16 bg-gradient-to-br from-navy to-navy-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-14 h-14 bg-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Mail size={26} className="text-white" />
        </div>

        <h2 className="font-display text-3xl md:text-4xl text-white mb-3">{t.newsletter}</h2>
        <p className="text-white/70 mb-8 text-lg">{t.newsletterDesc}</p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-3 bg-green-500/20 border border-green-500/30 rounded-xl px-6 py-4 text-green-400">
            <CheckCircle size={22} />
            <span className="font-semibold">
              {/* Show success message */}
              ¡Listo! / All set! Check your inbox.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.yourEmail}
              required
              className="input-field flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-brand-orange focus:border-brand-orange"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary px-8 flex-shrink-0 disabled:opacity-70"
            >
              {status === 'loading' ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : null}
              {t.subscribe}
            </button>
          </form>
        )}

        <p className="text-white/40 text-xs mt-4">
          {/* Privacy note */}
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
