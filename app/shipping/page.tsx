import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'Envíos — Nova Shop CR' };

export default function ShippingPage() {
  return (
    <InfoPage
      titleEs="Envíos"
      titleEn="Shipping"
      subtitleEs="Todo lo que necesitás saber sobre tus entregas."
      subtitleEn="Everything you need to know about your deliveries."
    >
      <h2>Tiempos de entrega</h2>
      <p>
        Enviamos a <strong>todo Costa Rica</strong> y <strong>Estados Unidos</strong>. La mayoría de
        nuestros productos se despachan desde bodegas en USA, lo que permite entregas más rápidas:
      </p>
      <ul>
        <li>🇨🇷 <strong>Costa Rica:</strong> 7 a 14 días hábiles</li>
        <li>🇺🇸 <strong>Estados Unidos:</strong> 5 a 10 días hábiles</li>
      </ul>

      <h2>Costo de envío</h2>
      <p>
        <strong>Envío gratis</strong> en pedidos superiores a $50. Para pedidos menores, el costo se
        calcula automáticamente en el checkout según tu ubicación.
      </p>

      <h2>Seguimiento</h2>
      <p>
        Apenas tu pedido sea despachado, recibirás un correo con el número de seguimiento. También
        podés rastrearlo en nuestra página de <a href="/track">Seguimiento de pedido</a>.
      </p>

      <h2>¿Preguntas?</h2>
      <p>
        Escribinos a <a href="/contact">nuestro formulario de contacto</a> y te respondemos en menos
        de 24 horas.
      </p>
    </InfoPage>
  );
}
