require('dotenv').config();
const { sql, poolPromise } = require('./config/db');

async function runMigration() {
    try {
        const pool = await poolPromise;
        console.log('Connected to DB. Running Migration Sprint 5 (RoutineExercises)...');

        // RoutineExercises
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RoutineExercises' and xtype='U')
            BEGIN
                CREATE TABLE RoutineExercises (
                    ExerciseID INT IDENTITY(1,1) PRIMARY KEY,
                    RoutineID INT NOT NULL,
                    ExerciseName NVARCHAR(100) NOT NULL,
                    Sets INT NOT NULL,
                    Reps INT NOT NULL,
                    Weight DECIMAL(5,2) NULL,
                    CONSTRAINT FK_RoutineExercises_Routines FOREIGN KEY (RoutineID) REFERENCES Routines(RoutineID) ON DELETE CASCADE
                );
                PRINT 'RoutineExercises table created.';
            END
            ELSE
            BEGIN
                PRINT 'RoutineExercises table already exists.';
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
