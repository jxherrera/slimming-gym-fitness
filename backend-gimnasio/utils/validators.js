/**
 * Validaciones de entrada reutilizables.
 *
 * Se mantienen como funciones puras (sin acceso a base de datos ni a req/res)
 * para poder probarlas unitariamente y para poder aplicarlas desde cualquier
 * controlador: alta de usuarios, cambio de contrasena y recuperacion.
 */

// Politica de contrasenas: minimo 8 caracteres, al menos una letra y un numero.
const PASSWORD_MIN_LENGTH = 8;

/**
 * @param {string} password
 * @returns {string|null} mensaje de error, o null si la contrasena es valida
 */
const validarPassword = (password) => {
    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
        return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    }
    if (!/[a-zA-Z]/.test(password)) {
        return 'La contraseña debe incluir al menos una letra.';
    }
    if (!/[0-9]/.test(password)) {
        return 'La contraseña debe incluir al menos un número.';
    }
    return null;
};

/**
 * Verifica que todos los campos indicados esten presentes y no vacios.
 *
 * @param {object} body            cuerpo de la peticion
 * @param {string[]} obligatorios  nombres de los campos requeridos
 * @returns {string[]} lista de campos faltantes (vacia si esta todo completo)
 */
const camposFaltantes = (body, obligatorios) =>
    obligatorios.filter((campo) => {
        const valor = body?.[campo];
        return valor === undefined || valor === null || String(valor).trim() === '';
    });

module.exports = { validarPassword, camposFaltantes, PASSWORD_MIN_LENGTH };
