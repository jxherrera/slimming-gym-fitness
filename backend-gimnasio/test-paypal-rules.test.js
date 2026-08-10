const test = require('node:test');
const assert = require('node:assert');
const { validateAmount, calculateEndDate, isIdempotent } = require('./utils/paypalRules');

test('validateAmount - rechaza cuando el importe capturado difiere del precio', () => {
    assert.strictEqual(validateAmount('50.00', '50.00'), true);
    assert.strictEqual(validateAmount(50, 50.00), true);
    assert.strictEqual(validateAmount('49.99', '50.00'), false);
    assert.strictEqual(validateAmount(0.01, 50), false);
});

test('calculateEndDate - calcula la fecha final sumando dias', () => {
    const start = new Date('2026-08-01T00:00:00Z');
    const end = calculateEndDate(start, 30);
    assert.strictEqual(end.toISOString(), '2026-08-31T00:00:00.000Z');
});

test('isIdempotent - detecta un ReferenceNumber ya existente', () => {
    const existing = [
        { ReferenceNumber: 'PAYID-123' },
        { ReferenceNumber: 'PAYID-456' }
    ];
    assert.strictEqual(isIdempotent('PAYID-456', existing), true);
    assert.strictEqual(isIdempotent('PAYID-789', existing), false);
    assert.strictEqual(isIdempotent('PAYID-123', []), false);
});
