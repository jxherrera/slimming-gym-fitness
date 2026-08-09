/**
 * Reglas de negocio del control de ingreso al gimnasio.
 *
 * Se mantienen aisladas de la base de datos a proposito: `evaluateAccess` es una
 * funcion pura, lo que permite probarla unitariamente sin conexion a SQL Server
 * y reutilizarla si en el futuro el ingreso llega desde otro canal (por ejemplo
 * un lector de codigo QR consumiendo el mismo endpoint).
 */

// Estados canonicos del dominio. Son la unica fuente de verdad: cualquier
// comparacion contra literales sueltos ('Active', 'Paid') es un bug.
const USER_ACTIVE = 'A';
const USER_INACTIVE = 'I';
const SUBSCRIPTION_PAID = 'P';
const SUBSCRIPTION_UNPAID = 'U';
const ROLE_MEMBER = 1;

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Convierte el EndDate de una suscripcion al dia calendario que representa.
 *
 * Las columnas DATE de SQL Server llegan como medianoche UTC (el driver mssql
 * usa useUTC: true por defecto), y una cadena '2026-08-08' tambien se parsea
 * como medianoche UTC. Si se leyeran con getters locales, en una zona con
 * offset negativo como Ecuador (UTC-5) el dia se correria 24 horas hacia atras
 * y una membresia que vence hoy apareceria como vencida.
 */
const diaDeSuscripcion = (fecha) => {
    const d = new Date(fecha);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

/**
 * Dia calendario de "hoy" segun el reloj local del servidor: para la recepcion,
 * hoy es el dia local, no el UTC.
 */
const diaDeHoy = (now) => Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

/**
 * Decide si un usuario puede ingresar al gimnasio.
 *
 * @param {number} roleId       Rol del usuario (1 = Socio; 2 y 3 son personal)
 * @param {object|null} sub     Suscripcion mas reciente { PaymentStatus, EndDate } o null
 * @param {Date} [now]          Fecha de evaluacion (inyectable para las pruebas)
 * @returns {{ accessGranted: boolean, status: string, reason: string }}
 */
const evaluateAccess = (roleId, sub, now = new Date()) => {
    // El personal (Entrenador/Administrador) no requiere membresia vigente.
    if (Number(roleId) !== ROLE_MEMBER) {
        return {
            accessGranted: true,
            status: 'Personal',
            reason: 'Acceso de personal autorizado'
        };
    }

    if (!sub) {
        return {
            accessGranted: false,
            status: 'Sin suscripción',
            reason: 'El socio no tiene ninguna membresía registrada'
        };
    }

    if (sub.PaymentStatus !== SUBSCRIPTION_PAID) {
        return {
            accessGranted: false,
            status: 'Pago pendiente',
            reason: 'La membresía tiene un pago pendiente de aprobación'
        };
    }

    const fin = diaDeSuscripcion(sub.EndDate);
    const hoy = diaDeHoy(now);

    // El mismo dia del vencimiento cuenta como vigente.
    if (fin < hoy) {
        return {
            accessGranted: false,
            status: 'Vencida',
            reason: `La membresía venció el ${new Date(fin).toLocaleDateString('es-EC', { timeZone: 'UTC' })}`
        };
    }

    const diasRestantes = Math.round((fin - hoy) / MS_POR_DIA);
    return {
        accessGranted: true,
        status: 'Activa',
        reason: diasRestantes === 0
            ? 'Membresía vigente, vence hoy'
            : `Membresía vigente, ${diasRestantes} día(s) restante(s)`
    };
};

module.exports = {
    evaluateAccess,
    USER_ACTIVE,
    USER_INACTIVE,
    SUBSCRIPTION_PAID,
    SUBSCRIPTION_UNPAID,
    ROLE_MEMBER
};
