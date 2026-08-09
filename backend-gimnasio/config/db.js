const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

if (process.env.DB_INSTANCE) {
  dbConfig.options.instanceName = process.env.DB_INSTANCE;
} else if (process.env.DB_PORT) {
  dbConfig.port = parseInt(process.env.DB_PORT, 10);
}

// Al arrancar el servidor, la base de datos puede no estar lista todavia: en una
// VM los servicios se inician en paralelo y SQL Server tarda mas que Node. Se
// reintenta durante un margen razonable antes de darse por vencido.
const INTENTOS_MAXIMOS = 5;
const ESPERA_ENTRE_INTENTOS_MS = 5000;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const conectar = async (intento = 1) => {
  try {
    const pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log('Conexión establecida con SQL Server');

    // Un error posterior del pool (reinicio de la BD, corte de red) llega como
    // evento: sin este manejador tumbaria el proceso completo.
    pool.on('error', (err) => {
      console.error('Error en el pool de conexiones:', err.message);
    });

    return pool;
  } catch (err) {
    console.error(`Error de conexión a la base de datos (intento ${intento}/${INTENTOS_MAXIMOS}): ${err.message}`);

    if (intento < INTENTOS_MAXIMOS) {
      console.error(`Reintentando en ${ESPERA_ENTRE_INTENTOS_MS / 1000}s...`);
      await esperar(ESPERA_ENTRE_INTENTOS_MS);
      return conectar(intento + 1);
    }

    console.error('No se pudo conectar a la base de datos. La API seguirá en pie y responderá');
    console.error('con error 500 en las operaciones que la requieran. Verifica DB_SERVER,');
    console.error('las credenciales y que el servicio de SQL Server esté activo.');
    throw err;
  }
};

const poolPromise = conectar();

// El proceso NO debe morir por no poder conectar: si la promesa quedara
// rechazada sin manejador, Node terminaria la aplicacion y PM2 entraria en un
// ciclo de reinicios. Cada controlador maneja su propio error al usar el pool.
poolPromise.catch(() => {});

module.exports = {
  sql,
  poolPromise
};
