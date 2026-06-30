const { sql, poolPromise } = require('./config/db');

async function run() {
  try {
    const pool = await poolPromise;
    const res = await pool.request().query('SELECT TOP 1 * FROM dbo.PhysicalEvaluations');
    console.log('Recordset column names:', Object.keys(res.recordset[0] || {}));
    console.log('Recordset rows:', res.recordset);
    process.exit(0);
  } catch (err) {
    console.error('Error inspecting:', err);
    process.exit(1);
  }
}

run();
