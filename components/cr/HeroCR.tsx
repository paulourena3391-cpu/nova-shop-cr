'use client';

// Premium "$10k agency" hero for the Costa Rica market (/cr only).
// Inspired by modern 21st.dev hero layouts: animated gradient mesh, kinetic
// headline, floating trust cards. Built on the project's existing design tokens
// (navy / brand-orange / ease-premium). The USA store (/) keeps its own Hero.

import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, Star, Zap } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const stats = [
  { Icon: Truck, title: 'Envío Express', desc: 'Bodega local · 1-3 días' },
  { Icon: ShieldCheck, title: 'Compra Protegida', desc: 'Pago 100% seguro' },
  { Icon: Star, title: '+4.8 / 5', desc: 'Miles de clientes ticos' },
  { Icon: Zap, title: 'Ofertas del día', desc: 'Hasta 60% de descuento' },
];

export default function HeroCR() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-navy">
      {/* ── Animated gradient mesh ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand-orange/25 blur-3xl"
        animate={reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.55, 0.8, 0.55] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 h-[24rem] w-[24rem] rounded-full bg-blue-500/15 blur-3xl"
        animate={reduce ? undefined : { scale: [1, 1.2, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <motion.div
          className="grid items-center gap-12 md:grid-cols-2"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* ── Left: copy ── */}
          <div>
            <motion.span
              variants={rise}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-orange"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-orange" />
              Nueva Colección 2026 · Costa Rica
            </motion.span>

            <motion.h1
              variants={rise}
              className="font-display text-[2.6rem] leading-[1.04] tracking-tightest text-white sm:text-6xl lg:text-[4.25rem]"
            >
              Lo mejor del shopping,
              <span className="relative ml-2 inline-block">
                <span className="bg-gradient-to-r from-brand-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                  directo a tu puerta
                </span>
                <motion.span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-brand-orange to-amber-300"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
                />
              </span>
            </motion.h1>

            <motion.p
              variants={rise}
              className="mt-6 max-w-md text-lg leading-relaxed text-white/70"
            >
              Tecnología, moda, hogar y más — con envío rápido desde bodega local y
              precios en colones. Calidad premium, sin esperas de aduana.
            </motion.p>

            <motion.div variants={rise} className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/cr/collections/cr-moda-mujer"
                className="group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-semibold text-white shadow-cta transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-cta-hover active:translate-y-0 active:scale-[0.98]"
                style={{ backgroundImage: 'linear-gradient(135deg, #FF7A2E 0%, #FF6B1A 55%, #f15e10 100%)' }}
              >
                Comprar ahora
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/cr/collections/cr-tecnologia"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/25 px-7 py-3.5 font-semibold text-white transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-white hover:bg-white/5 active:translate-y-0"
              >
                Ver Tecnología
              </Link>
            </motion.div>

            {/* Social proof line */}
            <motion.div variants={rise} className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {['#FF6B1A', '#1a2d45', '#FF7A2E', '#0F1B2D'].map((c, i) => (
                  <span
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-navy"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-amber-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <p className="text-white/60">+2.500 ticos ya compraron</p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: floating trust cards ── */}
          <motion.div variants={rise} className="grid grid-cols-2 gap-4">
            {stats.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                animate={reduce ? undefined : { y: [0, i % 2 === 0 ? -8 : 8, 0] }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-orange/20">
                  <Icon size={20} className="text-brand-orange" />
                </div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-xs text-white/50">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade into page */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-100 to-transparent" />
    </section>
  );
}
