CREATE TABLE CoachWorkHours (
    ID INT PRIMARY KEY IDENTITY(1,1),
    CoachID INT,
    DayOfWeek VARCHAR(20) NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    FOREIGN KEY (CoachID) REFERENCES Users(UserID),
    CONSTRAINT CHK_CoachWorkHours_Time CHECK (StartTime < EndTime)
);
GO

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
);
GO

EXEC sp_rename 'Payments.ReceiptUrl', 'ReceiptImageUrl', 'COLUMN';
GO

ALTER TABLE Payments
ADD CONSTRAINT CHK_Payments_Status CHECK (Status IN ('P', 'V', 'A', 'R'));
GO

ALTER TABLE Payments
ADD LastModifiedBy INT NULL;
GO
ALTER TABLE Payments
ADD CONSTRAINT FK_Payments_LastModifiedBy FOREIGN KEY (LastModifiedBy) REFERENCES Users(UserID);
GO

CREATE TABLE AuditLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    PaymentID INT,
    OldStatus CHAR(1),
    NewStatus CHAR(1),
    ChangedByUserID INT,
    ChangedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (PaymentID) REFERENCES Payments(PaymentID),
    FOREIGN KEY (ChangedByUserID) REFERENCES Users(UserID)
);
GO

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
GO

CREATE TABLE EmailLogs (
    EmailLogID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    EmailType VARCHAR(50) NOT NULL,
    SentAt DATETIME DEFAULT GETDATE(),
    Status VARCHAR(20) NOT NULL, 
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
GO
