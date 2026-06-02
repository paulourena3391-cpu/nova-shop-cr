'use client';

// Barra de progreso naranja en la parte superior — se activa al navegar entre páginas
import { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function PageProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const start = useCallback(() => {
    setVisible(true);
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 90) { clearInterval(interval); p = 90; }
      setProgress(p);
    }, 150);
    return interval;
  }, []);

  useEffect(() => {
    const interval = start();
    const finish = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => { setVisible(false); setProgress(0); }, 300);
    }, 600);
    return () => { clearInterval(interval); clearTimeout(finish); };
  }, [pathname, searchParams, start]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-transparent pointer-events-none">
      <div
        className="h-full bg-brand-orange shadow-[0_0_8px_#FF6B1A] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
