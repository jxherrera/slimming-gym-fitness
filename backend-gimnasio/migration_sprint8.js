require('dotenv').config();
const { sql, poolPromise } = require('./config/db');

async function runMigration() {
    try {
        const pool = await poolPromise;
        console.log('Connected to DB. Running Migration Sprint 8 (Routine Templates and Exercise Catalog)...');

        // ExerciseCatalog
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ExerciseCatalog' and xtype='U')
            BEGIN
                CREATE TABLE ExerciseCatalog (
                    ExerciseID INT IDENTITY(1,1) PRIMARY KEY,
                    Name NVARCHAR(150) NOT NULL UNIQUE,
                    MuscleGroup NVARCHAR(100) NULL,
                    Description NVARCHAR(MAX) NULL
                );
                PRINT 'ExerciseCatalog table created.';
            END
            ELSE
            BEGIN
                PRINT 'ExerciseCatalog table already exists.';
            END
        `);

        // RoutineTemplates
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RoutineTemplates' and xtype='U')
            BEGIN
                CREATE TABLE RoutineTemplates (
                    TemplateID INT IDENTITY(1,1) PRIMARY KEY,
                    CoachID INT NOT NULL,
                    TemplateName NVARCHAR(150) NOT NULL,
                    Goal NVARCHAR(255) NULL,
                    CreatedAt DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (CoachID) REFERENCES Users(UserID)
                );
                PRINT 'RoutineTemplates table created.';
            END
            ELSE
            BEGIN
                PRINT 'RoutineTemplates table already exists.';
            END
        `);

        // RoutineTemplateExercises
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RoutineTemplateExercises' and xtype='U')
            BEGIN
                CREATE TABLE RoutineTemplateExercises (
                    TemplateExerciseID INT IDENTITY(1,1) PRIMARY KEY,
                    TemplateID INT NOT NULL,
                    ExerciseName NVARCHAR(150) NOT NULL,
                    Sets INT NOT NULL,
                    Reps INT NOT NULL,
                    Weight DECIMAL(5,2) NULL,
                    DayOfWeek NVARCHAR(20) NULL,
                    CONSTRAINT FK_TemplateExercises_Templates FOREIGN KEY (TemplateID) REFERENCES RoutineTemplates(TemplateID) ON DELETE CASCADE
                );
                PRINT 'RoutineTemplateExercises table created.';
            END
            ELSE
            BEGIN
                PRINT 'RoutineTemplateExercises table already exists.';
            END
        `);

        console.log('Migration Sprint 8 completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
