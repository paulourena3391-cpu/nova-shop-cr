'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const { t } = useLang();

  if (!visible) return null;

  return (
    <div className="bg-navy text-white text-sm py-2.5 px-4 text-center relative">
      <p className="font-medium">{t.announcement}</p>
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
}
