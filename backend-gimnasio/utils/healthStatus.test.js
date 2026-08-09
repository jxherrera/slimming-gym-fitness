const test = require('node:test');
const assert = require('node:assert');
const { buildHealthResponse } = require('./healthStatus');

test('con la base disponible reporta ok y responde 200', () => {
    const { httpStatus, body } = buildHealthResponse({
        dbOk: true,
        uptimeSeconds: 42.7,
        instance: 'a1b2c3d4e5f6'
    });

    assert.strictEqual(httpStatus, 200);
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.database, 'ok');
});

test('sin base disponible reporta degraded y responde 503', () => {
    const { httpStatus, body } = buildHealthResponse({
        dbOk: false,
        uptimeSeconds: 10,
        instance: 'local'
    });

    assert.strictEqual(httpStatus, 503);
    assert.strictEqual(body.status, 'degraded');
    assert.strictEqual(body.database, 'unreachable');
});

test('el tiempo de actividad se entrega en segundos enteros', () => {
    const { body } = buildHealthResponse({ dbOk: true, uptimeSeconds: 99.999, instance: 'x' });
    assert.strictEqual(body.uptime, 99);
});

test('incluye el identificador de instancia, necesario para comprobar el balanceo', () => {
    const { body } = buildHealthResponse({ dbOk: true, uptimeSeconds: 1, instance: 'replica-3' });
    assert.strictEqual(body.instance, 'replica-3');
});
