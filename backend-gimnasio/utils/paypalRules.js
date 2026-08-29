/**
 * Reglas de negocio del cobro con PayPal.
 *
 * Funciones puras, sin red ni base de datos, para poder probarlas unitariamente.
 * Aqui vive lo que protege el dinero: que el importe cobrado sea el que
 * corresponde al plan y que un mismo cobro no active dos suscripciones.
 */

const ESTADO_CAPTURA_COMPLETA = 'COMPLETED';

// Tolerancia al comparar importes: PayPal devuelve el monto como cadena con dos
// decimales y la base lo guarda como DECIMAL(10,2). Un centavo de diferencia por
// redondeo es aceptable; mas que eso indica manipulacion.
const TOLERANCIA_CENTAVOS = 0.01;

/**
 * Decide si una captura de PayPal puede activar la membresia.
 *
 * @param {object} captura            { status, amount, captureId } devuelto por PayPal
 * @param {number} precioDelPlan      precio leido de la base de datos, NUNCA del cliente
 * @returns {{ valida: boolean, motivo: string|null }}
 */
const validarCaptura = (captura, precioDelPlan) => {
    if (!captura || !captura.captureId) {
        return { valida: false, motivo: 'La respuesta de PayPal no incluye un identificador de captura.' };
    }

    if (captura.status !== ESTADO_CAPTURA_COMPLETA) {
        return { valida: false, motivo: `El pago no está completado en PayPal (estado: ${captura.status}).` };
    }

    const cobrado = Number(captura.amount);
    const esperado = Number(precioDelPlan);

    if (!Number.isFinite(cobrado) || !Number.isFinite(esperado) || esperado <= 0) {
        return { valida: false, motivo: 'No se pudo comparar el importe cobrado con el precio del plan.' };
    }

    // Comprobacion central: el importe se contrasta contra el precio de la base.
    // Sin esto, una orden manipulada permitiria pagar centavos por un plan completo.
    if (Math.abs(cobrado - esperado) > TOLERANCIA_CENTAVOS) {
        return {
            valida: false,
            motivo: `El importe cobrado (${cobrado}) no coincide con el precio del plan (${esperado}).`
        };
    }

    return { valida: true, motivo: null };
};

/**
 * Calcula la fecha de fin de la suscripcion.
 *
 * Usa componentes UTC de forma explicita por la misma razon que
 * utils/accessRules.js: las columnas DATE de SQL Server viajan como medianoche
 * UTC, y mezclar lectores locales desplaza el dia en zonas con offset negativo.
 *
 * @param {Date} inicio
 * @param {number} duracionDias
 * @returns {Date}
 */
const calcularFechaFin = (inicio, duracionDias) => {
    const dias = Number(duracionDias);
    if (!Number.isFinite(dias) || dias <= 0) {
        throw new Error('La duración del plan debe ser un número de días positivo.');
    }

    const base = Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
    return new Date(base + dias * 24 * 60 * 60 * 1000);
};

/**
 * Construye la respuesta publica de configuracion para el navegador.
 *
 * Devuelve exclusivamente lo que el frontend necesita. El secret NUNCA puede
 * formar parte de este objeto: cualquiera puede leerlo desde el navegador.
 */
const construirConfigPublica = (env = process.env) => {
    const habilitado = Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);

    if (!habilitado) {
        return { enabled: false };
    }

    return {
        enabled: true,
        clientId: env.PAYPAL_CLIENT_ID,
        mode: env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox',
        currency: env.PAYPAL_CURRENCY || 'USD'
    };
};

module.exports = {
    validarCaptura,
    calcularFechaFin,
    construirConfigPublica,
    ESTADO_CAPTURA_COMPLETA,
    TOLERANCIA_CENTAVOS
};
