'use client';

import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function TrustBadges() {
  const { t } = useLang();

  const badges = [
    { Icon: Truck, title: t.trustShipping, desc: t.trustShippingDesc, color: 'text-blue-500' },
    { Icon: ShieldCheck, title: t.trustPayments, desc: t.trustPaymentsDesc, color: 'text-green-500' },
    { Icon: RefreshCw, title: t.trustReturns, desc: t.trustReturnsDesc, color: 'text-purple-500' },
    { Icon: Headphones, title: t.trustSupport, desc: t.trustSupportDesc, color: 'text-brand-orange' },
  ];

  return (
    <section className="bg-white border-y border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map(({ Icon, title, desc, color }) => (
            <div key={title} className="flex items-center gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-navy text-sm">{title}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
