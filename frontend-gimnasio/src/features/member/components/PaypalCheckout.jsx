import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/services/api';
import { useToast } from '@/hooks/useToast';
import './PaypalCheckout.css';

/**
 * Pago en linea con PayPal.
 *
 * Renderiza los botones oficiales de PayPal (el de PayPal y el de tarjeta de
 * credito o debito). El importe NO se envia desde aqui: el servidor lo resuelve
 * a partir del planId consultando la base de datos.
 *
 * Si el servidor informa que PayPal no esta configurado, el componente no
 * renderiza nada y el socio sigue teniendo disponible el pago por comprobante.
 */
const PaypalCheckout = ({ plan, onPaymentSuccess }) => {
  const toast = useToast();
  const contenedorRef = useRef(null);
  const botonesRef = useRef(null);

  const [config, setConfig] = useState(null);
  const [sdkListo, setSdkListo] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  // El plan vigente se guarda en una referencia para que las funciones que PayPal
  // conserva internamente lean siempre el valor actual y no el del primer render.
  const planRef = useRef(plan);
  useEffect(() => { planRef.current = plan; }, [plan]);

  // 1. Configuracion del servidor. El Client ID no se incrusta al compilar: asi
  // se puede pasar de sandbox a produccion sin reconstruir la imagen.
  useEffect(() => {
    let cancelado = false;

    api.get('/payments/paypal/config')
      .then(({ data }) => { if (!cancelado) setConfig(data); })
      .catch(() => { if (!cancelado) setConfig({ enabled: false }); });

    return () => { cancelado = true; };
  }, []);

  // 2. Carga del SDK de PayPal, una sola vez.
  useEffect(() => {
    if (!config?.enabled) return;

    if (window.paypal) {
      setSdkListo(true);
      return;
    }

    const existente = document.querySelector('script[data-paypal-sdk]');
    if (existente) {
      existente.addEventListener('load', () => setSdkListo(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(config.clientId)}&currency=${encodeURIComponent(config.currency)}&intent=capture`;
    script.dataset.paypalSdk = 'true';
    script.async = true;
    script.onload = () => setSdkListo(true);
    script.onerror = () => setError('No se pudo cargar la pasarela de pago. Revisa tu conexión.');
    document.body.appendChild(script);
  }, [config]);

  const crearOrden = useCallback(async () => {
    // Solo se envia el plan. Si se enviara el importe, cualquiera podria pedir
    // una orden por un valor distinto al del plan.
    const { data } = await api.post('/payments/paypal/order', {
      planId: planRef.current.PlanID
    });
    return data.orderId;
  }, []);

  const aprobar = useCallback(async (datos) => {
    setProcesando(true);
    setError('');

    try {
      const { data } = await api.post('/payments/paypal/capture', {
        orderId: datos.orderID,
        planId: planRef.current.PlanID
      });

      toast.success(data.message || 'Pago procesado. Tu membresía ya está activa.');
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err) {
      const mensaje = err.response?.data?.message || 'No se pudo confirmar el pago. Si el cobro se realizó, contacta al gimnasio.';
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setProcesando(false);
    }
  }, [onPaymentSuccess, toast]);

  // 3. Render de los botones. Se recrean si cambia el plan, porque la orden se
  // genera con el plan vigente en el momento del clic.
  useEffect(() => {
    if (!sdkListo || !window.paypal || !contenedorRef.current || !plan) return;

    if (botonesRef.current) {
      botonesRef.current.close();
      botonesRef.current = null;
    }
    contenedorRef.current.innerHTML = '';

    const botones = window.paypal.Buttons({
      style: { layout: 'vertical', shape: 'rect', label: 'pay', height: 45 },
      createOrder: crearOrden,
      onApprove: aprobar,
      onCancel: () => toast.info('Pago cancelado. Puedes intentarlo de nuevo cuando quieras.'),
      onError: (err) => {
        console.error('Error del SDK de PayPal:', err);
        setError('Ocurrió un problema con la pasarela de pago. Intenta de nuevo.');
      }
    });

    botones.render(contenedorRef.current).catch(() => {
      setError('No se pudieron mostrar los botones de pago.');
    });

    botonesRef.current = botones;

    return () => {
      if (botonesRef.current) {
        botonesRef.current.close();
        botonesRef.current = null;
      }
    };
  }, [sdkListo, plan, crearOrden, aprobar, toast]);

  // PayPal no configurado en el servidor: no se muestra nada.
  if (!config?.enabled) return null;

  return (
    <div className="paypal-checkout">
      <div className="paypal-separador"><span>o paga en línea</span></div>

      {!plan && (
        <p className="paypal-aviso">Selecciona un plan para pagar con PayPal o tarjeta.</p>
      )}

      {plan && (
        <>
          <p className="paypal-monto">
            Pagarás <strong>${Number(plan.Price).toFixed(2)} USD</strong> por el plan {plan.PlanName}.
            Tu membresía se activa de inmediato, sin esperar verificación.
          </p>

          {config.mode === 'sandbox' && (
            <p className="paypal-sandbox">
              Modo de pruebas: no se realizará ningún cobro real.
            </p>
          )}

          <div className={`paypal-botones ${procesando ? 'procesando' : ''}`} ref={contenedorRef} />

          {procesando && <p className="paypal-procesando">Confirmando tu pago, no cierres esta ventana…</p>}
          {error && <p className="paypal-error">{error}</p>}
        </>
      )}
    </div>
  );
};

export default PaypalCheckout;
