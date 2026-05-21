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

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Conecion completa con SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Error de conexión a la base de datos:', err);
        throw err;
    });

module.exports = {
    sql,
    poolPromise
};