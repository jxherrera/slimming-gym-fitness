require('dotenv').config();
const { sql, poolPromise } = require('./config/db');

async function runMigration() {
    try {
        const pool = await poolPromise;
        console.log('Connected to DB. Running Migration Sprint 6 (RoutineExercises DayOfWeek)...');

        // Check if DayOfWeek exists
        const checkCol = await pool.request().query(`
            IF COL_LENGTH('RoutineExercises', 'DayOfWeek') IS NULL
            BEGIN
                ALTER TABLE RoutineExercises ADD DayOfWeek NVARCHAR(20) NULL;
                PRINT 'DayOfWeek column added to RoutineExercises.';
            END
            ELSE
            BEGIN
                PRINT 'DayOfWeek column already exists.';
            END
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
