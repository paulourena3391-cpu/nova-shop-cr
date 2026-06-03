import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'Devoluciones — Nova Shop CR' };

export default function ReturnsPage() {
  return (
    <InfoPage
      titleEs="Devoluciones"
      titleEn="Returns"
      subtitleEs="Compras sin riesgo. 30 días para devolver."
      subtitleEn="Risk-free shopping. 30-day returns."
    >
      <h2>Política de 30 días</h2>
      <p>
        Si no estás satisfecho con tu compra, tenés <strong>30 días</strong> desde la fecha de entrega
        para solicitar una devolución o cambio.
      </p>

      <h2>Condiciones</h2>
      <ul>
        <li>El producto debe estar sin uso y en su empaque original.</li>
        <li>Debe incluir todas las etiquetas y accesorios.</li>
        <li>Necesitás el comprobante de compra (correo de confirmación).</li>
      </ul>

      <h2>Cómo solicitar una devolución</h2>
      <ol>
        <li>Escribinos por <a href="/contact">el formulario de contacto</a> con tu número de pedido.</li>
        <li>Te enviamos las instrucciones de devolución en 24 horas.</li>
        <li>Una vez recibido el producto, procesamos tu reembolso en 5-7 días hábiles.</li>
      </ol>

      <h2>Reembolsos</h2>
      <p>
        El reembolso se realiza al mismo método de pago original. Los costos de envío original no son
        reembolsables, salvo que el producto haya llegado defectuoso o equivocado.
      </p>
    </InfoPage>
  );
}
