'use client';

// Premium animated stats band (CR homepage). Numbers count up when scrolled
// into view → "established brand" feel that builds trust and lifts conversion.
// Lightweight: one IntersectionObserver + rAF count-up, GPU-friendly. No heavy libs.

import { useEffect, useRef, useState } from 'react';
import { Users, Star, Truck, ShieldCheck } from 'lucide-react';

function useCountUp(target: number, run: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration]);
  return val;
}

const STATS = [
  { Icon: Users,       target: 2500, decimals: 0, prefix: '', suffix: '+', label: 'Clientes felices' },
  { Icon: Star,        target: 4.8,  decimals: 1, prefix: '', suffix: '★', label: 'Calificación promedio' },
  { Icon: Truck,       target: 3,    decimals: 0, prefix: '1-', suffix: ' días', label: 'Envío a todo CR' },
  { Icon: ShieldCheck, target: 100,  decimals: 0, prefix: '', suffix: '%', label: 'Compra protegida' },
];

export default function StatsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRun(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRun(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-navy py-12">
      {/* soft brand glow */}
      <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-48 w-[40rem] -translate-x-1/2 rounded-full bg-brand-orange/15 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-6 sm:gap-6 md:grid-cols-4">
        {STATS.map(({ Icon, target, decimals, prefix, suffix, label }) => (
          <Stat key={label} Icon={Icon} target={target} decimals={decimals} prefix={prefix} suffix={suffix} label={label} run={run} />
        ))}
      </div>
    </section>
  );
}

function Stat({
  Icon, target, decimals, prefix, suffix, label, run,
}: {
  Icon: typeof Users; target: number; decimals: number; prefix: string; suffix: string; label: string; run: boolean;
}) {
  const val = useCountUp(target, run);
  const display =
    decimals > 0
      ? val.toFixed(decimals)
      : Math.round(val).toLocaleString('es-CR');

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-orange/15 ring-1 ring-brand-orange/25">
        <Icon size={20} className="text-brand-orange" />
      </div>
      <div className="font-display text-3xl md:text-4xl tracking-tightest text-white tabular-nums">
        {prefix}
        {display}
        {suffix}
      </div>
      <p className="mt-1 text-xs md:text-sm text-white/55">{label}</p>
    </div>
  );
}
