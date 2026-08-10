const test = require('node:test');
const assert = require('node:assert');
const { validarCaptura, calcularFechaFin, construirConfigPublica } = require('./paypalRules');

const CAPTURA_OK = { status: 'COMPLETED', amount: '50.00', captureId: '3XY123ABC' };

test('acepta una captura completada cuyo importe coincide con el plan', () => {
    const r = validarCaptura(CAPTURA_OK, 50.00);
    assert.strictEqual(r.valida, true);
    assert.strictEqual(r.motivo, null);
});

test('rechaza el cobro cuando el importe es menor al precio del plan', () => {
    // Escenario de manipulacion: se intenta pagar un centavo por un plan de 50.
    const r = validarCaptura({ ...CAPTURA_OK, amount: '0.01' }, 50.00);
    assert.strictEqual(r.valida, false);
    assert.match(r.motivo, /no coincide con el precio del plan/);
});

test('rechaza el cobro cuando el importe es mayor al precio del plan', () => {
    const r = validarCaptura({ ...CAPTURA_OK, amount: '500.00' }, 50.00);
    assert.strictEqual(r.valida, false);
});

test('tolera un centavo de diferencia por redondeo', () => {
    assert.strictEqual(validarCaptura({ ...CAPTURA_OK, amount: '50.01' }, 50.00).valida, true);
});

test('rechaza una captura que no esta completada', () => {
    const r = validarCaptura({ ...CAPTURA_OK, status: 'PENDING' }, 50.00);
    assert.strictEqual(r.valida, false);
    assert.match(r.motivo, /no está completado/);
});

test('rechaza una respuesta sin identificador de captura', () => {
    assert.strictEqual(validarCaptura({ status: 'COMPLETED', amount: '50.00' }, 50).valida, false);
    assert.strictEqual(validarCaptura(null, 50).valida, false);
});

test('rechaza cuando el precio del plan no es utilizable', () => {
    assert.strictEqual(validarCaptura(CAPTURA_OK, 0).valida, false);
    assert.strictEqual(validarCaptura(CAPTURA_OK, undefined).valida, false);
});

test('calcula la fecha de fin sumando los dias del plan', () => {
    const fin = calcularFechaFin(new Date('2026-08-09T15:30:00'), 30);
    assert.strictEqual(fin.toISOString().slice(0, 10), '2026-09-08');
});

test('la fecha de fin no se desplaza por la hora del dia', () => {
    // Mismo dia calendario a distintas horas debe producir el mismo vencimiento.
    const temprano = calcularFechaFin(new Date('2026-08-09T01:00:00'), 30);
    const tarde = calcularFechaFin(new Date('2026-08-09T23:00:00'), 30);
    assert.strictEqual(temprano.getTime(), tarde.getTime());
});

test('rechaza una duracion de plan invalida', () => {
    assert.throws(() => calcularFechaFin(new Date('2026-08-09T10:00:00'), 0));
    assert.throws(() => calcularFechaFin(new Date('2026-08-09T10:00:00'), -5));
});

test('la configuracion publica NUNCA incluye el secret', () => {
    const cfg = construirConfigPublica({
        PAYPAL_CLIENT_ID: 'id-publico',
        PAYPAL_CLIENT_SECRET: 'secreto-que-no-debe-salir',
        PAYPAL_MODE: 'sandbox'
    });

    const serializada = JSON.stringify(cfg);
    assert.ok(!serializada.includes('secreto-que-no-debe-salir'), 'el secret se filtró en la configuración pública');
    assert.strictEqual(cfg.clientId, 'id-publico');
    assert.strictEqual(cfg.mode, 'sandbox');
    assert.strictEqual(cfg.currency, 'USD');
});

test('reporta PayPal deshabilitado cuando faltan credenciales', () => {
    assert.deepStrictEqual(construirConfigPublica({}), { enabled: false });
    assert.deepStrictEqual(construirConfigPublica({ PAYPAL_CLIENT_ID: 'x' }), { enabled: false });
});

test('solo el modo live se reporta como live', () => {
    const base = { PAYPAL_CLIENT_ID: 'x', PAYPAL_CLIENT_SECRET: 'y' };
    assert.strictEqual(construirConfigPublica({ ...base, PAYPAL_MODE: 'live' }).mode, 'live');
    assert.strictEqual(construirConfigPublica({ ...base, PAYPAL_MODE: 'produccion' }).mode, 'sandbox');
    assert.strictEqual(construirConfigPublica(base).mode, 'sandbox');
});
