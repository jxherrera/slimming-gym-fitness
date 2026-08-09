/**
 * Armado de la respuesta del endpoint de salud.
 *
 * Funcion pura, sin acceso a base de datos ni a req/res, para poder probarla
 * unitariamente igual que utils/accessRules.js.
 */

/**
 * @param {{dbOk: boolean, uptimeSeconds: number, instance: string}} datos
 * @returns {{httpStatus: number, body: object}}
 */
const buildHealthResponse = ({ dbOk, uptimeSeconds, instance }) => {
    const status = dbOk ? 'ok' : 'degraded';

    return {
        // 503 cuando la base no responde: la API esta viva pero no puede
        // atender operaciones con datos, y un monitor debe enterarse.
        httpStatus: dbOk ? 200 : 503,
        body: {
            status,
            uptime: Math.floor(uptimeSeconds),
            database: dbOk ? 'ok' : 'unreachable',
            // Identifica que replica atendio la peticion. En Docker, HOSTNAME es
            // el identificador del contenedor: es la forma de comprobar que el
            // balanceo de carga esta repartiendo entre replicas.
            instance
        }
    };
};

module.exports = { buildHealthResponse };
