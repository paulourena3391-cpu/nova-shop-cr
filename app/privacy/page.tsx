import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'Privacidad — Nova Shop CR' };

export default function PrivacyPage() {
  return (
    <InfoPage
      titleEs="Política de Privacidad"
      titleEn="Privacy Policy"
      subtitleEs="Última actualización: enero 2026"
      subtitleEn="Last updated: January 2026"
    >
      <h2>Información que recopilamos</h2>
      <p>
        Recopilamos la información que nos proporcionás al realizar un pedido: nombre, dirección de
        envío, correo electrónico y datos de pago. Los datos de pago se procesan de forma segura y no
        se almacenan en nuestros servidores.
      </p>

      <h2>Cómo usamos tu información</h2>
      <ul>
        <li>Para procesar y enviar tus pedidos.</li>
        <li>Para comunicarnos contigo sobre el estado de tu compra.</li>
        <li>Para mejorar nuestros productos y servicio.</li>
        <li>Para enviarte ofertas, solo si te suscribiste a nuestro boletín.</li>
      </ul>

      <h2>Protección de datos</h2>
      <p>
        Usamos encriptación SSL de 256 bits para proteger toda la información. Nunca vendemos ni
        compartimos tus datos personales con terceros para fines de marketing.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Podés solicitar acceso, corrección o eliminación de tus datos personales en cualquier momento
        escribiéndonos a <a href="/contact">nuestro formulario de contacto</a>.
      </p>

      <h2>Cookies</h2>
      <p>
        Usamos cookies esenciales para el funcionamiento del carrito y para mejorar tu experiencia.
        Podés desactivarlas en la configuración de tu navegador.
      </p>
    </InfoPage>
  );
}
