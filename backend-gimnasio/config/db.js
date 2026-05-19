const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_NAME,
    port: 1433,
    options: {
        encrypt: false, // Cámbialo a false si estás en tu propia PC
        trustServerCertificate: true // Obligatorio para evitar errores de seguridad locales
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Conectado completa con SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Error de conexión a la base de datos:', err);
    });

module.exports = {
    sql,
    poolPromise
};