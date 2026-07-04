const { sql, poolPromise } = require('./config/db');

async function migrate() {
    try {
        const pool = await poolPromise;
        
        console.log("Creating CoachWorkHours table...");
        try {
            await pool.request().query(`
                CREATE TABLE CoachWorkHours (
                    ID INT PRIMARY KEY IDENTITY(1,1),
                    CoachID INT,
                    DayOfWeek VARCHAR(20) NOT NULL,
                    StartTime TIME NOT NULL,
                    EndTime TIME NOT NULL,
                    FOREIGN KEY (CoachID) REFERENCES Users(UserID),
                    CONSTRAINT CHK_CoachWorkHours_Time CHECK (StartTime < EndTime)
                )
            `);
            console.log("CoachWorkHours table created.");
        } catch (e) {
            console.log("CoachWorkHours might already exist or error:", e.message);
        }

        console.log("Creating Classes table (Sprint 4 version)...");
        try {
            await pool.request().query(`
                CREATE TABLE Classes (
                    ClassID INT PRIMARY KEY IDENTITY(1,1),
                    CoachID INT,
                    ClassName VARCHAR(100) NOT NULL,
                    DayOfWeek VARCHAR(20) NOT NULL,
                    StartTime TIME NOT NULL,
                    EndTime TIME NOT NULL,
                    MaxCapacity INT NOT NULL,
                    FOREIGN KEY (CoachID) REFERENCES Users(UserID),
                    CONSTRAINT CHK_Classes_Time CHECK (StartTime < EndTime)
                )
            `);
            console.log("Classes table created.");
        } catch (e) {
            console.log("Classes might already exist or error:", e.message);
        }

        console.log("Renaming column ReceiptUrl to ReceiptImageUrl in Payments...");
        try {
            await pool.request().query(`
                EXEC sp_rename 'Payments.ReceiptUrl', 'ReceiptImageUrl', 'COLUMN'
            `);
            console.log("Column renamed successfully.");
        } catch (e) {
            console.log("Column rename might have already been done or error:", e.message);
        }

        console.log("Adding status check constraint to Payments...");
        try {
            await pool.request().query(`
                ALTER TABLE Payments
                ADD CONSTRAINT CHK_Payments_Status CHECK (Status IN ('P', 'V', 'A', 'R'))
            `);
            console.log("Constraint CHK_Payments_Status added.");
        } catch (e) {
            console.log("Constraint might already exist or error:", e.message);
        }

        console.log("Adding LastModifiedBy column to Payments...");
        try {
            await pool.request().query(`
                ALTER TABLE Payments
                ADD LastModifiedBy INT NULL;
                
                ALTER TABLE Payments
                ADD CONSTRAINT FK_Payments_LastModifiedBy FOREIGN KEY (LastModifiedBy) REFERENCES Users(UserID);
            `);
            console.log("LastModifiedBy column and FK added to Payments.");
        } catch (e) {
            console.log("LastModifiedBy column might already exist or error:", e.message);
        }

        console.log("Creating AuditLogs table...");
        try {
            await pool.request().query(`
                CREATE TABLE AuditLogs (
                    LogID INT PRIMARY KEY IDENTITY(1,1),
                    PaymentID INT,
                    OldStatus CHAR(1),
                    NewStatus CHAR(1),
                    ChangedByUserID INT,
                    ChangedAt DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (PaymentID) REFERENCES Payments(PaymentID),
                    FOREIGN KEY (ChangedByUserID) REFERENCES Users(UserID)
                )
            `);
            console.log("AuditLogs table created.");
        } catch (e) {
            console.log("AuditLogs might already exist or error:", e.message);
        }

        console.log("Creating Trigger trg_AuditPaymentStatus...");
        try {
            await pool.request().query(`
                CREATE TRIGGER trg_AuditPaymentStatus
                ON Payments
                AFTER UPDATE
                AS
                BEGIN
                    SET NOCOUNT ON;

                    IF UPDATE(Status)
                    BEGIN
                        INSERT INTO AuditLogs (PaymentID, OldStatus, NewStatus, ChangedByUserID)
                        SELECT 
                            i.PaymentID,
                            d.Status,
                            i.Status,
                            i.LastModifiedBy
                        FROM inserted i
                        INNER JOIN deleted d ON i.PaymentID = d.PaymentID
                        WHERE i.Status <> d.Status;
                    END
                END;
            `);
            console.log("Trigger trg_AuditPaymentStatus created.");
        } catch (e) {
            console.log("Trigger might already exist or error:", e.message);
        }

        console.log("Creating EmailLogs table...");
        try {
            await pool.request().query(`
                CREATE TABLE EmailLogs (
                    EmailLogID INT PRIMARY KEY IDENTITY(1,1),
                    UserID INT,
                    EmailType VARCHAR(50) NOT NULL,
                    SentAt DATETIME DEFAULT GETDATE(),
                    Status VARCHAR(20) NOT NULL, 
                    FOREIGN KEY (UserID) REFERENCES Users(UserID)
                )
            `);
            console.log("EmailLogs table created.");
        } catch (e) {
            console.log("EmailLogs might already exist or error:", e.message);
        }

        console.log("Sprint 4 Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
