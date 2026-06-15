const { sql, poolPromise } = require('./config/db');

async function migrate() {
    try {
        const pool = await poolPromise;
        
        console.log("Adding Status to Plans...");
        try {
            await pool.request().query(`ALTER TABLE Plans ADD Status CHAR(1) DEFAULT 'A'`);
            console.log("Status column added.");
        } catch (e) {
            console.log("Status column might already exist:", e.message);
        }

        console.log("Creating CoachPermissions...");
        try {
            await pool.request().query(`
                CREATE TABLE CoachPermissions (
                    PermissionID INT PRIMARY KEY IDENTITY(1,1),
                    CoachID INT UNIQUE,
                    CanEditOthersRoutines BIT DEFAULT 0,
                    FOREIGN KEY (CoachID) REFERENCES Users(UserID)
                )
            `);
            console.log("CoachPermissions created.");
        } catch (e) {
            console.log("CoachPermissions might already exist:", e.message);
        }

        console.log("Creating CoachAssignments...");
        try {
            await pool.request().query(`
                CREATE TABLE CoachAssignments (
                    AssignmentID INT PRIMARY KEY IDENTITY(1,1),
                    CoachID INT,
                    MemberID INT UNIQUE,
                    AssignedAt DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (CoachID) REFERENCES Users(UserID),
                    FOREIGN KEY (MemberID) REFERENCES Users(UserID)
                )
            `);
            console.log("CoachAssignments created.");
        } catch (e) {
            console.log("CoachAssignments might already exist:", e.message);
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
