const JWT_SECRET = process.env.JWT_SECRET;

// Se falla al arrancar de forma deliberada: es preferible que el servidor no
// inicie a que firme tokens con una clave debil o conocida publicamente.
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.error('FATAL: la variable de entorno JWT_SECRET no esta definida o tiene menos de 32 caracteres.');
    console.error('Generala con: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
    process.exit(1);
}

module.exports = { JWT_SECRET, JWT_EXPIRES_IN: '24h' };
