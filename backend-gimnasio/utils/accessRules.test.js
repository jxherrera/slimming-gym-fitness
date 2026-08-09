const test = require('node:test');
const assert = require('node:assert');
const { evaluateAccess } = require('./accessRules');

// Fecha fija: nunca usar new Date() dentro de una prueba, o el resultado
// dependeria del dia en que se ejecuta la suite.
const HOY = new Date('2026-08-08T10:00:00');

test('concede acceso a socio con membresia pagada y vigente', () => {
    const r = evaluateAccess(1, { PaymentStatus: 'P', EndDate: '2026-09-15' }, HOY);
    assert.strictEqual(r.accessGranted, true);
    assert.strictEqual(r.status, 'Activa');
    assert.match(r.reason, /38 día\(s\)/);
});

test('deniega acceso a socio con membresia vencida', () => {
    const r = evaluateAccess(1, { PaymentStatus: 'P', EndDate: '2026-07-01' }, HOY);
    assert.strictEqual(r.accessGranted, false);
    assert.strictEqual(r.status, 'Vencida');
    assert.match(r.reason, /venció/);
});

test('deniega acceso a socio con pago pendiente de aprobacion', () => {
    const r = evaluateAccess(1, { PaymentStatus: 'U', EndDate: '2026-09-15' }, HOY);
    assert.strictEqual(r.accessGranted, false);
    assert.strictEqual(r.status, 'Pago pendiente');
});

test('deniega acceso a socio sin ninguna membresia registrada', () => {
    const r = evaluateAccess(1, null, HOY);
    assert.strictEqual(r.accessGranted, false);
    assert.strictEqual(r.status, 'Sin suscripción');
});

test('concede acceso al entrenador aunque no tenga membresia', () => {
    const r = evaluateAccess(2, null, HOY);
    assert.strictEqual(r.accessGranted, true);
    assert.strictEqual(r.status, 'Personal');
});

test('concede acceso al administrador aunque no tenga membresia', () => {
    assert.strictEqual(evaluateAccess(3, null, HOY).accessGranted, true);
});

test('concede acceso el mismo dia de vencimiento (caso borde)', () => {
    const r = evaluateAccess(1, { PaymentStatus: 'P', EndDate: '2026-08-08' }, HOY);
    assert.strictEqual(r.accessGranted, true);
    assert.strictEqual(r.reason, 'Membresía vigente, vence hoy');
});

test('deniega acceso el dia siguiente al vencimiento', () => {
    const r = evaluateAccess(1, { PaymentStatus: 'P', EndDate: '2026-08-07' }, HOY);
    assert.strictEqual(r.accessGranted, false);
    assert.strictEqual(r.status, 'Vencida');
});

test('el rol llega como texto desde SQL y aun asi se evalua bien', () => {
    // mssql puede devolver el RoleID como string segun el driver
    const r = evaluateAccess('1', null, HOY);
    assert.strictEqual(r.accessGranted, false, 'un socio sin membresia no debe entrar');
});
