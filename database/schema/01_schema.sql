-- ==============================================================================
-- SCRIPT DE ESQUEMA PRINCIPAL - SLIMMING GYM FITNESS
-- Regenerado y Unificado desde la Fuente de Verdad (Producción)
-- Autor: Ariel Rueda (Administración de BD y Arquitectura)
-- ==============================================================================

USE [GymDatabase];
GO

-- ==============================================================================
-- 1. CREACIÓN DE TABLAS
-- ==============================================================================

CREATE TABLE Roles ( 
    RoleID INT PRIMARY KEY IDENTITY(1,1), 
    RoleName VARCHAR(50) NOT NULL 
); 
GO

CREATE TABLE Users ( 
    UserID INT PRIMARY KEY IDENTITY(1,1), 
    IDNumber VARCHAR(15) UNIQUE NOT NULL,  
    FirstName VARCHAR(100) NOT NULL, 
    LastName VARCHAR(100) NOT NULL, 
    Email VARCHAR(150) UNIQUE NOT NULL, 
    PasswordHash VARCHAR(255) NOT NULL,  
    PhoneNumber VARCHAR(20), 
    RoleID INT, 
    Status CHAR(1) DEFAULT 'A', 
    CreatedAt DATETIME DEFAULT GETDATE(), 
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleID) REFERENCES Roles(RoleID),
    CONSTRAINT CK_Users_Status CHECK (Status IN ('A','I'))
); 
GO
CREATE INDEX IX_Users_IDNumber ON Users(IDNumber);
GO

CREATE TABLE PasswordResetTokens (
    TokenID    INT PRIMARY KEY IDENTITY(1,1),
    UserID     INT NOT NULL,
    TokenHash  VARCHAR(255) NOT NULL,   -- SHA-256 del token, nunca el token en claro
    ExpiresAt  DATETIME NOT NULL,
    UsedAt     DATETIME NULL,
    CreatedAt  DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_PasswordResetTokens_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO
CREATE INDEX IX_PasswordResetTokens_TokenHash ON PasswordResetTokens(TokenHash);
GO

CREATE TABLE Plans ( 
    PlanID INT PRIMARY KEY IDENTITY(1,1), 
    PlanName VARCHAR(50) NOT NULL, 
    Price DECIMAL(10,2) NOT NULL, 
    DurationDays INT NOT NULL,
    Status CHAR(1) DEFAULT 'A' 
); 
GO

CREATE TABLE Subscriptions ( 
    SubscriptionID INT PRIMARY KEY IDENTITY(1,1), 
    UserID INT, 
    PlanID INT, 
    StartDate DATE NOT NULL, 
    EndDate DATE NOT NULL, 
    PaymentStatus CHAR(1) DEFAULT 'U', 
    CONSTRAINT FK_Subscriptions_Users FOREIGN KEY (UserID) REFERENCES Users(UserID), 
    CONSTRAINT FK_Subscriptions_Plans FOREIGN KEY (PlanID) REFERENCES Plans(PlanID),
    CONSTRAINT CK_Subs_PaymentStatus CHECK (PaymentStatus IN ('P','U'))
); 
GO
-- Acelera las consultas de usuarios activos (cron y paneles)
CREATE INDEX IX_Subscriptions_UserID_EndDate ON Subscriptions(UserID, EndDate DESC);
-- Acelera la búsqueda de vencimientos (expirationChecker.js)
CREATE INDEX IX_Subscriptions_PaymentStatus_EndDate ON Subscriptions(PaymentStatus, EndDate);
GO

CREATE TABLE Routines ( 
    RoutineID INT PRIMARY KEY IDENTITY(1,1), 
    UserID INT, 
    CoachID INT,
    RoutineName VARCHAR(100), 
    Goal VARCHAR(255),
    Status CHAR(1) DEFAULT 'A',  
    AssignedAt DATETIME DEFAULT GETDATE(), 
    CONSTRAINT FK_Routines_Users FOREIGN KEY (UserID) REFERENCES Users(UserID), 
    CONSTRAINT FK_Routines_Coach FOREIGN KEY (CoachID) REFERENCES Users(UserID) 
); 
GO

CREATE TABLE Attendance ( 
    AttendanceID INT PRIMARY KEY IDENTITY(1,1), 
    UserID INT, 
    CheckInTime DATETIME DEFAULT GETDATE(), 
    CONSTRAINT FK_Attendance_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO
-- Acelera la validación de ingreso diario y dashboards
CREATE INDEX IX_Attendance_CheckInTime ON Attendance(CheckInTime);
GO

CREATE TABLE Notifications ( 
    NotificationID INT PRIMARY KEY IDENTITY(1,1), 
    UserID INT, 
    Title VARCHAR(100) NOT NULL,
    Message VARCHAR(255) NOT NULL, 
    Type VARCHAR(50), 
    IsRead BIT DEFAULT 0, 
    CreatedAt DATETIME DEFAULT GETDATE(), 
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY IDENTITY(1,1),
    SubscriptionID INT, 
    AmountPaid DECIMAL(10,2) NOT NULL,
    PaymentDate DATETIME DEFAULT GETDATE(),
    PaymentMethod VARCHAR(50), 
    ReferenceNumber VARCHAR(100), 
    ReceiptImageUrl VARCHAR(500), -- [CORRECCIÓN] Columna validada desde el .bak
    Status CHAR(1) DEFAULT 'P', 
    CONSTRAINT FK_Payments_Subscriptions FOREIGN KEY (SubscriptionID) REFERENCES Subscriptions(SubscriptionID),
    CONSTRAINT CK_Payments_Status CHECK (Status IN ('A','P','R'))
);
GO
-- Acelera la filtración de pagos pendientes para el admin
CREATE INDEX IX_Payments_Status ON Payments(Status);
GO

CREATE TABLE CoachPermissions (
    PermissionID INT PRIMARY KEY IDENTITY(1,1),
    CoachID INT UNIQUE,
    CanEditOthersRoutines BIT DEFAULT 0,
    CanManagePlans BIT DEFAULT 0,
    CanSendMessages BIT DEFAULT 0,
    CONSTRAINT FK_CoachPermissions_Coach FOREIGN KEY (CoachID) REFERENCES Users(UserID)
);
GO

CREATE TABLE CoachAssignments (
    AssignmentID INT PRIMARY KEY IDENTITY(1,1),
    CoachID INT,
    MemberID INT UNIQUE,
    AssignedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_CoachAssignments_Coach FOREIGN KEY (CoachID) REFERENCES Users(UserID),
    CONSTRAINT FK_CoachAssignments_Member FOREIGN KEY (MemberID) REFERENCES Users(UserID)
);
GO
