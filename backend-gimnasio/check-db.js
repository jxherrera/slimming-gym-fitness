require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true
    }
};

async function check() {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
        `);
        console.log(result.recordset.map(r => r.TABLE_NAME));
        process.exit(0);
    } catch (err) {
        console.error(err);
    }
}
check();
