const test = require('node:test');
const assert = require('node:assert');
const { validarPassword, camposFaltantes } = require('./validators');

test('acepta una contrasena con letras y numeros de 8 o mas caracteres', () => {
    assert.strictEqual(validarPassword('Gimnasio2026'), null);
    assert.strictEqual(validarPassword('abc12345'), null);
});

test('rechaza contrasenas de menos de 8 caracteres', () => {
    assert.match(validarPassword('abc123'), /al menos 8 caracteres/);
});

test('rechaza contrasenas sin numeros', () => {
    assert.match(validarPassword('abcdefgh'), /al menos un número/);
});

test('rechaza contrasenas sin letras', () => {
    assert.match(validarPassword('12345678'), /al menos una letra/);
});

test('rechaza valores ausentes o que no son texto', () => {
    assert.ok(validarPassword(undefined));
    assert.ok(validarPassword(null));
    assert.ok(validarPassword(12345678));
});

test('detecta campos obligatorios ausentes, vacios o con solo espacios', () => {
    const faltantes = camposFaltantes(
        { Email: 'socio@gym.com', FirstName: '   ', LastName: '' },
        ['Email', 'FirstName', 'LastName', 'Password']
    );
    assert.deepStrictEqual(faltantes, ['FirstName', 'LastName', 'Password']);
});

test('no reporta faltantes cuando el cuerpo esta completo', () => {
    const faltantes = camposFaltantes({ Email: 'a@b.c', Password: 'abc12345' }, ['Email', 'Password']);
    assert.deepStrictEqual(faltantes, []);
});
