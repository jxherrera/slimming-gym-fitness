const { sql, poolPromise } = require('./config/db');

async function migrate() {
    try {
        const pool = await poolPromise;
        
        console.log("Creating Attendance table...");
        try {
            await pool.request().query(`
                CREATE TABLE Attendance (
                    AttendanceID INT PRIMARY KEY IDENTITY(1,1),
                    UserID INT NOT NULL,
                    CheckInTime DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (UserID) REFERENCES Users(UserID)
                )
            `);
            console.log("Attendance table created.");
        } catch (e) {
            console.log("Attendance might already exist:", e.message);
        }

        console.log("Creating Notifications table...");
        try {
            await pool.request().query(`
                CREATE TABLE Notifications (
                    NotificationID INT PRIMARY KEY IDENTITY(1,1),
                    UserID INT NOT NULL,
                    Message NVARCHAR(500) NOT NULL,
                    IsRead BIT DEFAULT 0,
                    CreatedAt DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (UserID) REFERENCES Users(UserID)
                )
            `);
            console.log("Notifications table created.");
        } catch (e) {
            console.log("Notifications might already exist:", e.message);
        }

        console.log("Creating Classes table...");
        try {
            await pool.request().query(`
                CREATE TABLE Classes (
                    ClassID INT PRIMARY KEY IDENTITY(1,1),
                    ClassName NVARCHAR(100) NOT NULL,
                    Description NVARCHAR(MAX),
                    CoachID INT,
                    MaxCapacity INT DEFAULT 20,
                    StartTime DATETIME,
                    EndTime DATETIME,
                    FOREIGN KEY (CoachID) REFERENCES Users(UserID)
                )
            `);
            console.log("Classes table created.");
        } catch (e) {
            console.log("Classes might already exist:", e.message);
        }

        console.log("Creating ClassReservations table...");
        try {
            await pool.request().query(`
                CREATE TABLE ClassReservations (
                    ReservationID INT PRIMARY KEY IDENTITY(1,1),
                    ClassID INT NOT NULL,
                    UserID INT NOT NULL,
                    ReservedAt DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (ClassID) REFERENCES Classes(ClassID),
                    FOREIGN KEY (UserID) REFERENCES Users(UserID)
                )
            `);
            console.log("ClassReservations table created.");
        } catch (e) {
            console.log("ClassReservations might already exist:", e.message);
        }

        console.log("Creating PhysicalEvaluations table...");
        try {
            await pool.request().query(`
                CREATE TABLE PhysicalEvaluations (
                    EvaluationID INT PRIMARY KEY IDENTITY(1,1),
                    UserID INT NOT NULL,
                    CoachID INT NOT NULL,
                    WeightKg DECIMAL(5,2),
                    BodyFatPercentage DECIMAL(5,2),
                    MuscleMassPercentage DECIMAL(5,2),
                    EvaluationDate DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (UserID) REFERENCES Users(UserID),
                    FOREIGN KEY (CoachID) REFERENCES Users(UserID)
                )
            `);
            console.log("PhysicalEvaluations table created.");
        } catch (e) {
            console.log("PhysicalEvaluations might already exist:", e.message);
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
