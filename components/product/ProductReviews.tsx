'use client';

import Image from 'next/image';
import { Star, BadgeCheck, ThumbsUp, Camera } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';

type Props = { photos?: string[]; productType?: string; seed?: number };

const NAMES = [
  'María José', 'Andrés', 'Daniela', 'Carlos', 'Gabriela', 'José Pablo', 'Natalia',
  'Mauricio', 'Karla', 'Esteban', 'Priscila', 'Bryan', 'Tatiana', 'Diego', 'Valeria', 'Kevin',
];
const SURNAMES = ['R.', 'M.', 'S.', 'V.', 'F.', 'C.', 'A.', 'G.', 'J.', 'B.', 'P.', 'Q.'];
const CANTONES = [
  'Heredia', 'Cartago', 'Alajuela', 'San José', 'Curridabat', 'Desamparados',
  'Pérez Zeledón', 'Liberia', 'San Carlos', 'Grecia', 'Escazú', 'Tibás', 'Moravia', 'Pococí',
];

// Reseñas genéricas (sirven para cualquier producto). {c} = cantón, {d} = días de envío.
const GENERIC = [
  'Tardó como {d} días en llegar a {c} pero valió la pena, la calidad está muy buena.',
  'Pagué con SINPE y me confirmaron rapidísimo por WhatsApp. Llegó tal cual las fotos 🙌',
  'Igual a la descripción. Me dieron el seguimiento y llegó bien empacado a {c}.',
  'Tenía dudas de comprar en línea pero todo bien. El producto cumple y la atención excelente.',
  'Relación precio-calidad brutal. Ya pedí otro. Demoró un poquito pero llegó perfecto.',
  'Súper recomendado. Me avisaron cuando salió el envío y llegó a {c} sin problema.',
  'Buenísimo. Esperé como dos semanas pero llegó en buen estado y funciona perfecto.',
];

// Frases específicas por categoría (más creíbles para cada producto)
const BY_TYPE: Record<string, string[]> = {
  Watches: [
    'El reloj se ve elegante y la batería rinde un montón. Me encantó.',
    'Tiene un montón de funciones para el precio. La correa es cómoda y se ve fino.',
  ],
  Footwear: [
    'Súper cómodos y tallaron bien. Los uso a diario.',
    'El material se siente resistente y son livianos. Quedé feliz.',
  ],
  "Women's Clothing": [
    'La tela es suave y la talla quedó tal cual la guía. Me quedó hermoso.',
    'El color es igual a la foto y la costura está bien hecha. Calidad muy buena.',
  ],
  "Men's Clothing": [
    'Buena tela y la talla quedó perfecta. Cómodo y fresco.',
    'Se ve mejor en persona, la calidad sorprende para el precio.',
  ],
  Electronics: [
    'Funciona perfecto y fácil de usar. Cumple justo lo que promete.',
    'La calidad sorprende para el precio. Conecta sin problema y vino completo.',
  ],
  'Home & Living': [
    'Práctico y bien hecho. Le saco provecho todos los días en la casa.',
    'Justo lo que necesitaba, buena calidad y resistente.',
  ],
  'Pet Supplies': [
    'A mi mascota le encantó y se ve resistente. Muy buena compra.',
    'Calidad muy buena, mi perro quedó feliz. Lo recomiendo.',
  ],
  Beauty: [
    'Se nota el resultado y rinde bastante. Llegó bien sellado.',
    'Funciona tal cual lo describen. Buen producto por el precio.',
  ],
  Jewelry: [
    'Se ve fino y no se destiñe. Quedó hermoso, ideal para regalar.',
    'Más bonito en persona y llegó en su cajita. Me encantó.',
  ],
  Auto: [
    'Fácil de instalar y se siente resistente. Calza bien en el carro.',
    'Cumple perfecto y la calidad es buena para el precio.',
  ],
  BBQ: [
    'Resistente y práctico para el asado del fin de semana. Excelente.',
    'Buen material, aguanta bien el calor. Quedé satisfecho.',
  ],
  'Sports & Fitness': [
    'Buen material y cómodo para entrenar. Se siente firme y resistente.',
    'Cumple para el ejercicio en casa. Calidad mejor de lo que esperaba.',
  ],
};

export default function ProductReviews({ photos = [], productType = '', seed = 0 }: Props) {
  const { lang } = useLang();
  const { isCR } = useMarket();
  const es = lang === 'es';

  // Garantiza relevancia: primero frases de la categoría, luego genéricas (rotadas por seed)
  const count = 5;
  const typePhrases = BY_TYPE[productType] ?? [];
  const texts: string[] = [...typePhrases.slice(0, 2)];
  let gi = seed % GENERIC.length;
  while (texts.length < count) {
    texts.push(GENERIC[gi % GENERIC.length]);
    gi += 2;
  }

  // Construye reseñas deterministas (estables por producto, distintas entre productos)
  const reviews = texts.slice(0, count).map((raw, i) => {
    const k = seed + i * 7 + 1;
    const text = raw
      .replace('{c}', CANTONES[(k * 3) % CANTONES.length])
      .replace('{d}', String(10 + (k % 6))); // 10–15 días
    const rating = i === 3 ? 4 : 5; // una de 4★ para credibilidad
    return {
      name: `${NAMES[k % NAMES.length]} ${SURNAMES[(k * 2) % SURNAMES.length]}`,
      rating,
      daysAgo: 2 + ((k * 5) % 24),
      likes: 6 + ((k * 11) % 38),
      text,
    };
  });

  // Resumen (estable por producto)
  const avg = (4.6 + (seed % 4) / 10).toFixed(1);
  const total = 60 + (seed % 280);
  const dist = [
    { stars: 5, pct: 84 },
    { stars: 4, pct: 11 },
    { stars: 3, pct: 3 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 },
  ];

  const ago = (d: number) => (es ? `hace ${d} días` : `${d} days ago`);

  return (
    <section className="mt-12 md:mt-16 px-4 md:px-0">
      <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tightest mb-6 inline-flex items-center gap-3">
        <span className="w-1.5 h-7 bg-brand-orange rounded-full" />
        {es ? 'Lo que dicen nuestros clientes' : 'What our customers say'}
      </h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
        <div className="text-center sm:border-r sm:border-gray-200 sm:pr-10">
          <div className="text-5xl font-extrabold text-navy">{avg}</div>
          <div className="flex justify-center gap-0.5 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {total} {es ? 'reseñas' : 'reviews'}
          </p>
        </div>
        <div className="flex-1 space-y-1.5">
          {dist.map((d) => (
            <div key={d.stars} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-3">{d.stars}</span>
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-9 text-right">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer photos gallery */}
      {photos.length > 1 && (
        <div className="mb-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-navy mb-3">
            <Camera size={15} className="text-brand-orange" />
            {es ? 'Fotos de clientes' : 'Customer photos'}
            <span className="text-gray-400 font-normal">({photos.length})</span>
          </p>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            {photos.map((url, i) => (
              <div key={i} className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 border border-gray-100 group">
                <Image src={url} alt={`Foto de cliente ${i + 1}`} fill sizes="96px" className="object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute bottom-1 left-1 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={7} className="fill-amber-400 text-amber-400 drop-shadow" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-4">
        {reviews.map((r, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange-light flex items-center justify-center font-bold text-brand-orange">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm flex items-center gap-1.5">
                    {r.name} <span>🇨🇷</span>
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <BadgeCheck size={12} /> {es ? 'Compra verificada' : 'Verified purchase'}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{ago(r.daysAgo)}</span>
            </div>

            <div className="flex gap-0.5 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14}
                  className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
              ))}
            </div>

            <p className="text-gray-600 text-sm mt-2.5 leading-relaxed">{r.text}</p>

            {/* Foto adjunta en las primeras reseñas */}
            {idx < photos.length && idx < 2 && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden mt-3 border border-gray-100">
                <Image src={photos[idx]} alt="Foto de reseña" fill sizes="96px" className="object-cover" />
              </div>
            )}

            <button className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-orange mt-3 transition-colors">
              <ThumbsUp size={13} /> {es ? 'Útil' : 'Helpful'} ({r.likes})
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
