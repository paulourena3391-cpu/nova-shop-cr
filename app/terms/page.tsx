import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'Términos — Nova Shop CR' };

export default function TermsPage() {
  return (
    <InfoPage
      titleEs="Términos de Servicio"
      titleEn="Terms of Service"
      subtitleEs="Última actualización: enero 2026"
      subtitleEn="Last updated: January 2026"
    >
      <h2>Aceptación de los términos</h2>
      <p>
        Al usar Nova Shop CR y realizar una compra, aceptás estos términos de servicio. Te
        recomendamos leerlos antes de comprar.
      </p>

      <h2>Productos y precios</h2>
      <p>
        Hacemos lo posible por mostrar información precisa de cada producto. Los precios están en
        dólares estadounidenses (USD) e incluyen los impuestos aplicables. Nos reservamos el derecho
        de corregir errores de precio.
      </p>

      <h2>Pedidos</h2>
      <p>
        Una vez confirmado tu pedido, recibirás un correo de confirmación. Nos reservamos el derecho
        de rechazar o cancelar pedidos en caso de error, fraude o falta de disponibilidad.
      </p>

      <h2>Envíos y devoluciones</h2>
      <p>
        Consultá nuestras políticas de <a href="/shipping">Envíos</a> y{' '}
        <a href="/returns">Devoluciones</a> para más detalles.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        Todo el contenido de este sitio (logos, textos, diseño) es propiedad de Nova Shop CR y no
        puede ser reproducido sin autorización.
      </p>

      <h2>Contacto</h2>
      <p>
        Si tenés preguntas sobre estos términos, escribinos a{' '}
        <a href="/contact">nuestro formulario de contacto</a>.
      </p>
    </InfoPage>
  );
}
