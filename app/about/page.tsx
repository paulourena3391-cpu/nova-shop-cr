import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'Acerca de — Nova Shop CR' };

export default function AboutPage() {
  return (
    <InfoPage
      titleEs="Acerca de Nova Shop CR"
      titleEn="About Nova Shop CR"
      subtitleEs="Tu destino de compras confiable en Costa Rica."
      subtitleEn="Your trusted shopping destination in Costa Rica."
    >
      <h2>Quiénes somos</h2>
      <p>
        Nova Shop CR nació con una idea simple: traer los mejores productos del mundo a Costa Rica y
        Estados Unidos, a precios justos y con un servicio en el que se pueda confiar. Seleccionamos
        cada producto pensando en calidad, estilo y precio.
      </p>

      <h2>Nuestra misión</h2>
      <p>
        Hacer las compras en línea <strong>fáciles, seguras y accesibles</strong> para todos. Cada
        pedido se despacha desde bodegas en USA para que recibas tus productos rápido y sin
        complicaciones.
      </p>

      <h2>Por qué elegirnos</h2>
      <ul>
        <li>✅ Envíos rápidos a Costa Rica y USA (7-14 días)</li>
        <li>✅ Pagos 100% seguros con encriptación SSL</li>
        <li>✅ Devoluciones sin problema en 30 días</li>
        <li>✅ Soporte real que te responde en menos de 24 horas</li>
      </ul>

      <h2>Comprá con confianza</h2>
      <p>
        Miles de productos, una sola tienda. Explorá nuestras <a href="/">colecciones</a> y descubrí
        por qué somos la tienda que está creciendo más rápido en Costa Rica.
      </p>
    </InfoPage>
  );
}
