'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/context/LanguageContext';

type TimeLeft = { d: number; h: number; m: number; s: number };

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  const s = Math.floor(diff / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

type Props = {
  targetDate?: Date;
};

export default function CountdownTimer({ targetDate }: Props) {
  const { t } = useLang();

  // Default: end of today midnight
  const target = targetDate ?? (() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  })();

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const units = [
    { value: timeLeft.d, label: t.days },
    { value: timeLeft.h, label: t.hours },
    { value: timeLeft.m, label: t.minutes },
    { value: timeLeft.s, label: t.seconds },
  ];

  return (
    <div className="flex items-center gap-2" aria-label="Countdown timer">
      <span className="text-sm font-medium text-gray-600 mr-1">{t.endsIn}:</span>
      {units.map(({ value, label }, idx) => (
        <div key={label} className="flex items-center gap-1">
          <div className="bg-navy text-white rounded-lg w-12 h-12 flex flex-col items-center justify-center shadow-sm">
            <span className="text-lg font-bold leading-none tabular-nums">{pad(value)}</span>
            <span className="text-[9px] text-white/60 uppercase tracking-wider">{label}</span>
          </div>
          {idx < units.length - 1 && (
            <span className="text-navy font-bold text-lg">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
