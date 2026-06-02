'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Mail } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

const paymentMethods = ['Visa', 'MC', 'AMEX', 'PayPal'];

export default function Footer() {
  const { t, lang } = useLang();

  const links = {
    company: [
      { label: lang === 'es' ? 'Acerca de nosotros' : 'About Us', href: '/about' },
      { label: lang === 'es' ? 'Carreras' : 'Careers', href: '/careers' },
      { label: lang === 'es' ? 'Prensa' : 'Press', href: '/press' },
      { label: lang === 'es' ? 'Blog' : 'Blog', href: '/blog' },
    ],
    help: [
      { label: lang === 'es' ? 'Centro de ayuda' : 'Help Center', href: '/help' },
      { label: lang === 'es' ? 'Seguimiento de pedido' : 'Track Order', href: '/track' },
      { label: lang === 'es' ? 'Devoluciones' : 'Returns', href: '/returns' },
      { label: lang === 'es' ? 'Contacto' : 'Contact Us', href: '/contact' },
    ],
    legal: [
      { label: lang === 'es' ? 'Privacidad' : 'Privacy Policy', href: '/privacy' },
      { label: lang === 'es' ? 'Términos' : 'Terms of Service', href: '/terms' },
      { label: lang === 'es' ? 'Cookies' : 'Cookie Policy', href: '/cookies' },
      { label: lang === 'es' ? 'Accesibilidad' : 'Accessibility', href: '/accessibility' },
    ],
  };

  return (
    <footer className="bg-navy text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display text-2xl text-white">
                Nova<span className="text-brand-orange">Shop</span>
                <span className="text-brand-orange text-sm font-sans ml-1">CR</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-5">
              {lang === 'es'
                ? 'Tu destino de compras confiable en Costa Rica. Productos premium al mejor precio.'
                : 'Your trusted shopping destination in Costa Rica. Premium products at the best price.'}
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Instagram, href: '#', label: 'Instagram' },
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-orange flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              {lang === 'es' ? 'Empresa' : 'Company'}
            </h3>
            <ul className="space-y-2.5">
              {links.company.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/70 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              {lang === 'es' ? 'Ayuda' : 'Help'}
            </h3>
            <ul className="space-y-2.5">
              {links.help.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/70 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              {lang === 'es' ? 'Legal' : 'Legal'}
            </h3>
            <ul className="space-y-2.5">
              {links.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/70 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm" suppressHydrationWarning>
            © {new Date().getFullYear()} Nova Shop CR.{' '}
            {lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </p>

          {/* Payment methods */}
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs mr-1">
              {lang === 'es' ? 'Pagos seguros:' : 'Secure payments:'}
            </span>
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="bg-white/10 text-white/70 text-xs px-2.5 py-1 rounded font-medium"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
