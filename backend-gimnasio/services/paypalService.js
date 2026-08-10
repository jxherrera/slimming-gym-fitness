/**
 * Comunicacion con la API de PayPal (Orders v2).
 *
 * Encapsula todo el trato con la pasarela para que los controladores no conozcan
 * el proveedor: si se cambiara de pasarela, se sustituye este modulo.
 *
 * Se usa `fetch` nativo de Node 22: no se agregan dependencias.
 */
require('dotenv').config();

const MODO = process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox';

const PAYPAL_API = MODO === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
const MONEDA = process.env.PAYPAL_CURRENCY || 'USD';

const TIMEOUT_MS = 15000;

/**
 * A diferencia de JWT_SECRET, la ausencia de credenciales de PayPal NO detiene
 * el servidor: el pago manual con comprobante debe seguir funcionando. El modulo
 * queda deshabilitado y el frontend simplemente no muestra el boton.
 */
const isPaypalConfigured = () => Boolean(CLIENT_ID && CLIENT_SECRET);

if (!isPaypalConfigured()) {
    console.warn('[PayPal] PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no definidos: el pago en línea queda deshabilitado.');
} else if (MODO === 'sandbox') {
    console.log('[PayPal] Operando en modo SANDBOX: los cobros no son reales.');
}

/** Petición con límite de tiempo: una pasarela lenta no debe colgar la API. */
const peticion = async (ruta, opciones = {}) => {
    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), TIMEOUT_MS);

    try {
        const respuesta = await fetch(`${PAYPAL_API}${ruta}`, { ...opciones, signal: control.signal });
        const cuerpo = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            const detalle = cuerpo?.message || cuerpo?.error_description || respuesta.statusText;
            const error = new Error(`PayPal respondió ${respuesta.status}: ${detalle}`);
            error.statusCode = 502;
            throw error;
        }

        return cuerpo;
    } catch (err) {
        if (err.name === 'AbortError') {
            const error = new Error('PayPal no respondió a tiempo. Intenta de nuevo.');
            error.statusCode = 504;
            throw error;
        }
        throw err;
    } finally {
        clearTimeout(temporizador);
    }
};

// El token de acceso dura unas 9 horas. Se conserva en memoria para no pedir uno
// nuevo en cada operación; se renueva un minuto antes de expirar por margen.
let tokenEnCache = null;
let tokenExpiraEn = 0;

const obtenerToken = async () => {
    if (!isPaypalConfigured()) {
        const error = new Error('PayPal no está configurado en el servidor.');
        error.statusCode = 503;
        throw error;
    }

    if (tokenEnCache && Date.now() < tokenExpiraEn) {
        return tokenEnCache;
    }

    const credenciales = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const datos = await peticion('/v1/oauth2/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credenciales}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    tokenEnCache = datos.access_token;
    tokenExpiraEn = Date.now() + (Number(datos.expires_in || 32000) - 60) * 1000;

    return tokenEnCache;
};

const cabecerasAutenticadas = async () => ({
    Authorization: `Bearer ${await obtenerToken()}`,
    'Content-Type': 'application/json'
});

/**
 * Crea una orden de pago.
 *
 * El importe lo recibe ya resuelto desde la base de datos: este modulo no lo
 * calcula ni lo acepta del cliente.
 *
 * @param {{planId: number, planName: string, precio: number}} plan
 * @returns {Promise<string>} identificador de la orden
 */
const crearOrden = async ({ planId, planName, precio }) => {
    const datos = await peticion('/v2/checkout/orders', {
        method: 'POST',
        headers: await cabecerasAutenticadas(),
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
                // custom_id permite contrastar despues que la orden capturada
                // corresponde al plan que el socio dijo estar comprando.
                custom_id: String(planId),
                description: `Membresía ${planName}`.slice(0, 127),
                amount: {
                    currency_code: MONEDA,
                    value: Number(precio).toFixed(2)
                }
            }],
            application_context: {
                brand_name: 'Slimming Gym Fitness',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW'
            }
        })
    });

    return datos.id;
};

/**
 * Captura (cobra) una orden previamente aprobada por el socio.
 *
 * @param {string} orderId
 * @returns {Promise<{status: string, captureId: string, amount: string, currency: string, customId: string}>}
 */
const capturarOrden = async (orderId) => {
    const datos = await peticion(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
        method: 'POST',
        headers: await cabecerasAutenticadas()
    });

    const captura = datos?.purchase_units?.[0]?.payments?.captures?.[0] || {};

    return {
        status: captura.status || datos.status,
        captureId: captura.id,
        amount: captura.amount?.value,
        currency: captura.amount?.currency_code,
        customId: captura.custom_id
    };
};

/**
 * Verifica que un evento de webhook provenga realmente de PayPal.
 *
 * Sin esta comprobacion el endpoint seria un mecanismo para activar membresias
 * sin pagar: bastaria enviar un JSON falso.
 *
 * @returns {Promise<boolean>}
 */
const verificarFirmaWebhook = async (cabeceras, cuerpo) => {
    if (!WEBHOOK_ID) {
        console.error('[PayPal] PAYPAL_WEBHOOK_ID no definido: no se puede verificar la firma del webhook.');
        return false;
    }

    const requeridas = [
        'paypal-transmission-id',
        'paypal-transmission-time',
        'paypal-transmission-sig',
        'paypal-cert-url',
        'paypal-auth-algo'
    ];

    if (requeridas.some((c) => !cabeceras[c])) {
        return false;
    }

    try {
        const datos = await peticion('/v1/notifications/verify-webhook-signature', {
            method: 'POST',
            headers: await cabecerasAutenticadas(),
            body: JSON.stringify({
                auth_algo: cabeceras['paypal-auth-algo'],
                cert_url: cabeceras['paypal-cert-url'],
                transmission_id: cabeceras['paypal-transmission-id'],
                transmission_sig: cabeceras['paypal-transmission-sig'],
                transmission_time: cabeceras['paypal-transmission-time'],
                webhook_id: WEBHOOK_ID,
                webhook_event: cuerpo
            })
        });

        return datos.verification_status === 'SUCCESS';
    } catch (error) {
        console.error('[PayPal] Error verificando la firma del webhook:', error.message);
        return false;
    }
};

module.exports = {
    isPaypalConfigured,
    obtenerToken,
    crearOrden,
    capturarOrden,
    verificarFirmaWebhook,
    MODO,
    MONEDA
};
