/**
 * Validaciones de entrada reutilizables.
 *
 * Se mantienen como funciones puras (sin acceso a base de datos ni a req/res)
 * para poder probarlas unitariamente y para poder aplicarlas desde cualquier
 * controlador: alta de usuarios, cambio de contrasena y recuperacion.
 */

// Politica de contrasenas: minimo 8 caracteres, al menos una letra y un numero.
const PASSWORD_MIN_LENGTH = 8;
const EMAIL_MAX_LENGTH = 150;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

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

/**
 * Valida una cedula ecuatoriana de persona natural mediante el algoritmo de modulo 10.
 *
 * @param {string} cedula
 * @returns {string|null} mensaje de error, o null si la cedula es valida
 */
const validarCedulaEC = (cedula) => {
    if (cedula === undefined || cedula === null || String(cedula).trim() === '') {
        return 'La cédula es obligatoria.';
    }
    const cedulaStr = String(cedula).trim();
    if (!/^\d+$/.test(cedulaStr)) {
        return 'La cédula solo puede contener números.';
    }
    if (cedulaStr.length !== 10) {
        return 'La cédula debe tener exactamente 10 dígitos.';
    }
    const provincia = parseInt(cedulaStr.substring(0, 2), 10);
    if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) {
        return 'La cédula no corresponde a una provincia válida del Ecuador.';
    }
    const tercerDigito = parseInt(cedulaStr[2], 10);
    if (tercerDigito >= 6) {
        return 'La cédula no corresponde a una persona natural.';
    }
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
        let prod = parseInt(cedulaStr[i], 10) * coeficientes[i];
        if (prod > 9) prod -= 9;
        suma += prod;
    }
    const verificadorEsperado = (10 - (suma % 10)) % 10;
    const verificadorReal = parseInt(cedulaStr[9], 10);
    if (verificadorEsperado !== verificadorReal) {
        return 'La cédula ingresada no es válida.';
    }
    return null;
};

/**
 * Helper para limpiar y limitar una cedula a 10 digitos numericos.
 *
 * @param {string|number} valor
 * @returns {string}
 */
const soloDigitosCedula = (valor) => {
    if (valor === undefined || valor === null) return '';
    return String(valor).replace(/\D/g, '').slice(0, 10);
};

/**
 * Valida el formato y longitud de un correo electronico.
 *
 * @param {string} email
 * @returns {string|null} mensaje de error, o null si el correo es valido
 */
const validarEmail = (email) => {
    if (email === undefined || email === null || String(email).trim() === '') {
        return 'El correo electrónico es obligatorio.';
    }
    const emailStr = String(email).trim();
    if (emailStr.length > EMAIL_MAX_LENGTH) {
        return 'El correo electrónico es demasiado largo.';
    }
    if (!EMAIL_REGEX.test(emailStr)) {
        return 'El correo electrónico no tiene un formato válido.';
    }
    return null;
};

/**
 * Validador numerico generico reutilizable con soporte para limites y tipo entero.
 *
 * @param {any} valor
 * @param {object} opciones
 * @param {string} [opciones.campo='El campo']
 * @param {number} [opciones.min]
 * @param {number} [opciones.max]
 * @param {boolean} [opciones.entero=false]
 * @returns {string|null}
 */
const validarNumero = (valor, { campo = 'El campo', min, max, entero = false } = {}) => {
    if (valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '')) {
        return `${campo} es obligatorio.`;
    }
    if (typeof valor === 'boolean') {
        return `${campo} debe ser un número válido.`;
    }
    const num = Number(valor);
    if (isNaN(num)) {
        return `${campo} debe ser un número válido.`;
    }
    if (entero && (!Number.isInteger(num) || (typeof valor === 'string' && valor.includes('.')))) {
        return `${campo} debe ser un número entero.`;
    }
    if (min !== undefined && num < min) {
        return `${campo} no puede ser menor que ${min}.`;
    }
    if (max !== undefined && num > max) {
        return `${campo} no puede ser mayor que ${max}.`;
    }
    return null;
};

module.exports = {
    validarPassword,
    camposFaltantes,
    validarCedulaEC,
    soloDigitosCedula,
    validarEmail,
    validarNumero,
    PASSWORD_MIN_LENGTH,
    EMAIL_MAX_LENGTH
};
