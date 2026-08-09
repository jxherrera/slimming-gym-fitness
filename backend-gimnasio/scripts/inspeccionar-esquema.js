const { sql, poolPromise } = require('./config/db');

async function checkCols() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'CoachAssignments'
        `);
        console.log("CoachAssignments columns:", result.recordset);

        const result2 = await pool.request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'CoachPermissions'
        `);
        console.log("CoachPermissions columns:", result2.recordset);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkCols();
