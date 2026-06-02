'use client';

import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function Hero() {
  const { t } = useLang();

  return (
    <section className="relative bg-navy overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center">
      {/* Background gradient decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-10 w-72 h-72 bg-brand-orange/10 rounded-full blur-3xl" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: content */}
          <div className="text-center md:text-left">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-brand-orange/20 text-brand-orange border border-brand-orange/30 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <Zap size={14} fill="currentColor" />
              {t.heroBadge}
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-5">
              {t.heroTitle}
            </h1>

            <p className="text-white/70 text-lg md:text-xl mb-8 max-w-lg">
              {t.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center md:items-start gap-3">
              <Link href="/collections/all" className="btn-primary text-base px-8 py-4 shadow-lg shadow-brand-orange/30">
                {t.shopNow}
                <ArrowRight size={18} />
              </Link>
              <Link href="/collections/trending" className="btn-outline text-base px-8 py-4 text-white border-white hover:bg-white hover:text-navy">
                {t.trending}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <ShieldCheck size={16} className="text-green-400" />
                {t.securePay}
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Zap size={16} className="text-brand-orange" />
                {t.fastShipping}
              </div>
            </div>
          </div>

          {/* Right: decorative product cards */}
          <div className="hidden md:flex items-center justify-center relative">
            <div className="relative w-full max-w-sm">
              {/* Main card */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-2xl">
                <div className="bg-white/5 rounded-xl h-52 flex items-center justify-center mb-4 text-white/20 text-6xl">
                  🛍️
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                  <div className="flex items-center justify-between mt-3">
                    <div className="h-6 bg-brand-orange/60 rounded w-1/3" />
                    <div className="h-9 bg-brand-orange rounded-lg w-2/5" />
                  </div>
                </div>
              </div>

              {/* Floating stat cards */}
              <div className="absolute -top-5 -left-8 bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2">
                <span className="text-2xl">📦</span>
                <div>
                  <p className="text-xs text-gray-500">Orders</p>
                  <p className="text-sm font-bold text-navy">50K+</p>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-6 bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="text-sm font-bold text-navy">4.9 / 5</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
