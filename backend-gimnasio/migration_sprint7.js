require('dotenv').config();
const { sql, poolPromise } = require('./config/db');

async function runMigration() {
    try {
        const pool = await poolPromise;
        console.log('Connected to DB. Running Migration Sprint 7 (Workout Sessions)...');

        // Create WorkoutSessions Table if it doesn't exist
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkoutSessions')
            BEGIN
                CREATE TABLE WorkoutSessions (
                    SessionID INT PRIMARY KEY IDENTITY(1,1),
                    UserID INT NOT NULL,
                    RoutineID INT NULL, 
                    CompletedAt DATETIME DEFAULT GETDATE(),
                    TotalExercisesCompleted INT NOT NULL DEFAULT 0,
                    FOREIGN KEY (UserID) REFERENCES Users(UserID),
                    FOREIGN KEY (RoutineID) REFERENCES Routines(RoutineID)
                );
                PRINT 'WorkoutSessions table created.';
            END
            ELSE
            BEGIN
                PRINT 'WorkoutSessions table already exists.';
            END
        `);

        // Create WorkoutSessionDetails Table if it doesn't exist
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkoutSessionDetails')
            BEGIN
                CREATE TABLE WorkoutSessionDetails (
                    DetailID INT PRIMARY KEY IDENTITY(1,1),
                    SessionID INT NOT NULL,
                    ExerciseName VARCHAR(150) NOT NULL,
                    SetsCompleted INT NOT NULL,
                    RepsCompleted INT NOT NULL,
                    WeightUsed DECIMAL(10,2) NULL, 
                    FOREIGN KEY (SessionID) REFERENCES WorkoutSessions(SessionID) ON DELETE CASCADE
                );
                PRINT 'WorkoutSessionDetails table created.';
            END
            ELSE
            BEGIN
                PRINT 'WorkoutSessionDetails table already exists.';
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
