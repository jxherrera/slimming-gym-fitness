require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true
    }
};

async function check() {
    try {
        let pool = await sql.connect(dbConfig);
        const query = `
            SELECT COLUMN_NAME, DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Classes'
        `;
        const result = await pool.request().query(query);
        console.log("Columns of Classes:", result.recordset);
        process.exit(0);
    } catch (err) {
        console.error(err);
    }
}
check();
