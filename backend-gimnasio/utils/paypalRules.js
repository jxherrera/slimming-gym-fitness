/**
 * Funciones puras para la logica de negocio de pagos con PayPal.
 */

/**
 * Verifica que el importe capturado por PayPal coincida con el precio del plan.
 * @param {string|number} capturedAmount 
 * @param {string|number} planPrice 
 * @returns {boolean}
 */
function validateAmount(capturedAmount, planPrice) {
    return Number(capturedAmount) === Number(planPrice);
}

/**
 * Calcula la fecha de fin de la membresía sumando días.
 * Utiliza setUTCDate para evitar problemas de zona horaria.
 * @param {Date|string} startDate 
 * @param {number} durationDays 
 * @returns {Date}
 */
function calculateEndDate(startDate, durationDays) {
    const end = new Date(startDate);
    end.setUTCDate(end.getUTCDate() + Number(durationDays));
    return end;
}

/**
 * Comprueba idempotencia: dado un conjunto de pagos existentes (de la BD),
 * y un referenceNumber de PayPal, verifica si ya existe.
 * @param {string} referenceNumber
 * @param {Array<{ReferenceNumber: string}>} existingPayments 
 * @returns {boolean}
 */
function isIdempotent(referenceNumber, existingPayments) {
    if (!existingPayments || !Array.isArray(existingPayments)) return true;
    return existingPayments.some(p => p.ReferenceNumber === referenceNumber);
}

module.exports = {
    validateAmount,
    calculateEndDate,
    isIdempotent
};
