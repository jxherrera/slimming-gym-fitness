const test = require('node:test');
const assert = require('node:assert');
const {
    validarPassword,
    camposFaltantes,
    validarCedulaEC,
    soloDigitosCedula,
    validarEmail,
    validarNumero
} = require('./validators');

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

// PRUEBAS DE CEDULA ECUATORIANA
test('acepta cedulas ecuatorianas validas', () => {
    assert.strictEqual(validarCedulaEC('1315948503'), null);
    assert.strictEqual(validarCedulaEC('1753960242'), null);
    assert.strictEqual(validarCedulaEC('1729389633'), null);
});

test('rechaza cedula obligatoria ausente o vacia', () => {
    assert.strictEqual(validarCedulaEC(undefined), 'La cédula es obligatoria.');
    assert.strictEqual(validarCedulaEC(null), 'La cédula es obligatoria.');
    assert.strictEqual(validarCedulaEC(''), 'La cédula es obligatoria.');
    assert.strictEqual(validarCedulaEC('   '), 'La cédula es obligatoria.');
});

test('rechaza cedula con letras o caracteres no numericos', () => {
    assert.strictEqual(validarCedulaEC('175396024A'), 'La cédula solo puede contener números.');
    assert.strictEqual(validarCedulaEC('1753-60242'), 'La cédula solo puede contener números.');
});

test('rechaza cedula con longitud diferente de 10 digitos', () => {
    assert.strictEqual(validarCedulaEC('175396024'), 'La cédula debe tener exactamente 10 dígitos.');
    assert.strictEqual(validarCedulaEC('17539602420'), 'La cédula debe tener exactamente 10 dígitos.');
});

test('rechaza cedula con provincia inexistente', () => {
    assert.strictEqual(validarCedulaEC('9999999999'), 'La cédula no corresponde a una provincia válida del Ecuador.');
    assert.strictEqual(validarCedulaEC('0000000000'), 'La cédula no corresponde a una provincia válida del Ecuador.');
    assert.strictEqual(validarCedulaEC('2500000000'), 'La cédula no corresponde a una provincia válida del Ecuador.');
});

test('rechaza cedula de persona no natural (tercer digito mayor o igual a 6)', () => {
    assert.strictEqual(validarCedulaEC('1760000000'), 'La cédula no corresponde a una persona natural.');
    assert.strictEqual(validarCedulaEC('1790000000'), 'La cédula no corresponde a una persona natural.');
});

test('rechaza cedula con digito verificador incorrecto', () => {
    assert.strictEqual(validarCedulaEC('1315948504'), 'La cédula ingresada no es válida.');
});

test('detecta transposicion de dos digitos contiguos por modulo 10', () => {
    assert.strictEqual(validarCedulaEC('1351948503'), 'La cédula ingresada no es válida.');
});

test('soloDigitosCedula filtra caracteres no numericos y corta a 10 digitos', () => {
    assert.strictEqual(soloDigitosCedula('1753-960242-99'), '1753960242');
    assert.strictEqual(soloDigitosCedula('abc1315948503xyz'), '1315948503');
    assert.strictEqual(soloDigitosCedula(null), '');
    assert.strictEqual(soloDigitosCedula(undefined), '');
});

// PRUEBAS DE CORREO ELECTRONICO
test('acepta correos electronicos con formato valido', () => {
    assert.strictEqual(validarEmail('socio@gym.com'), null);
    assert.strictEqual(validarEmail('admin.fitness@slimming.com.ec'), null);
    assert.strictEqual(validarEmail('user+tag@domain.co'), null);
});

test('rechaza correo ausente o vacio', () => {
    assert.strictEqual(validarEmail(undefined), 'El correo electrónico es obligatorio.');
    assert.strictEqual(validarEmail(null), 'El correo electrónico es obligatorio.');
    assert.strictEqual(validarEmail(''), 'El correo electrónico es obligatorio.');
    assert.strictEqual(validarEmail('   '), 'El correo electrónico es obligatorio.');
});

test('rechaza correo demasiado largo (> 150 caracteres)', () => {
    const correoLargo = `${'a'.repeat(145)}@gym.com`;
    assert.strictEqual(validarEmail(correoLargo), 'El correo electrónico es demasiado largo.');
});

test('rechaza correos con formato invalido', () => {
    assert.strictEqual(validarEmail('correo-invalido'), 'El correo electrónico no tiene un formato válido.');
    assert.strictEqual(validarEmail('sin_arroba.com'), 'El correo electrónico no tiene un formato válido.');
    assert.strictEqual(validarEmail('usuario@sin_extension'), 'El correo electrónico no tiene un formato válido.');
    assert.strictEqual(validarEmail('usuario@dominio.c'), 'El correo electrónico no tiene un formato válido.');
    assert.strictEqual(validarEmail('usuario @dominio.com'), 'El correo electrónico no tiene un formato válido.');
});

// PRUEBAS DE NUMEROS (PRECIO, DURACION, MEDIDAS)
test('valida rangos y limites numericos correctamente', () => {
    assert.strictEqual(validarNumero(29.99, { campo: 'El precio', min: 0.01, max: 99999.99 }), null);
    assert.strictEqual(validarNumero(0, { campo: 'El precio', min: 0.01, max: 99999.99 }), 'El precio no puede ser menor que 0.01.');
    assert.strictEqual(validarNumero(100000, { campo: 'El precio', min: 0.01, max: 99999.99 }), 'El precio no puede ser mayor que 99999.99.');
});

test('exige enteros cuando entero es true', () => {
    assert.strictEqual(validarNumero(30, { campo: 'La duración', min: 1, max: 3650, entero: true }), null);
    assert.strictEqual(validarNumero(30.5, { campo: 'La duración', min: 1, max: 3650, entero: true }), 'La duración debe ser un número entero.');
    assert.strictEqual(validarNumero('30.2', { campo: 'La duración', min: 1, max: 3650, entero: true }), 'La duración debe ser un número entero.');
});

test('rechaza valores no numericos o ausentes en campos numericos', () => {
    assert.strictEqual(validarNumero(undefined, { campo: 'El precio' }), 'El precio es obligatorio.');
    assert.strictEqual(validarNumero(null, { campo: 'El precio' }), 'El precio es obligatorio.');
    assert.strictEqual(validarNumero('', { campo: 'El precio' }), 'El precio es obligatorio.');
    assert.strictEqual(validarNumero('abc', { campo: 'El precio' }), 'El precio debe ser un número válido.');
    assert.strictEqual(validarNumero(true, { campo: 'El precio' }), 'El precio debe ser un número válido.');
});
