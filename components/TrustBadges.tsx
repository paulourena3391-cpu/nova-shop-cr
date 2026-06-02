'use client';

import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function TrustBadges() {
  const { t } = useLang();

  const badges = [
    { Icon: Truck,        title: t.trustShipping,  desc: t.trustShippingDesc },
    { Icon: ShieldCheck,  title: t.trustPayments,  desc: t.trustPaymentsDesc },
    { Icon: RefreshCw,    title: t.trustReturns,   desc: t.trustReturnsDesc  },
    { Icon: Headphones,   title: t.trustSupport,   desc: t.trustSupportDesc  },
  ];

  return (
    <section className="bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200">
          {badges.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 px-6 py-5">
              <Icon size={22} className="text-navy flex-shrink-0" />
              <div>
                <p className="font-semibold text-navy text-sm">{title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
