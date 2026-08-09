/**
 * Envoltorio para controladores asincronos.
 *
 * Evita repetir el bloque try/catch con console.error + res.status(500) en cada
 * controlador: cualquier promesa rechazada se deriva a next(), y de ahi al
 * errorHandler global registrado al final de la cadena en server.js.
 *
 * Uso:
 *   exports.miControlador = asyncHandler(async (req, res) => { ... });
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
