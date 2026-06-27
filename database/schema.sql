-- 1. ROLES TABLE -- Defines the types of users in the system (Admin, Coach, Member) 
CREATE TABLE Roles ( 
    RoleID INT PRIMARY KEY IDENTITY(1,1), 
    RoleName VARCHAR(50) NOT NULL 
); 
 -- 2. USERS TABLE -- Consolidated table for staff and gym members 
CREATE TABLE Users ( 
    UserID INT PRIMARY KEY IDENTITY(1,1), 
    IDNumber VARCHAR(15) UNIQUE NOT NULL, -- National ID / Passport 
    FirstName VARCHAR(100) NOT NULL, 
    LastName VARCHAR(100) NOT NULL, 
    Email VARCHAR(150) UNIQUE NOT NULL, 
    PasswordHash VARCHAR(255) NOT NULL,  
    PhoneNumber VARCHAR(20), 
    RoleID INT, 
    Status CHAR(1) DEFAULT 'A', -- 'A' for Active, 'I' for Inactive 
    CreatedAt DATETIME DEFAULT GETDATE(), 
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) 
); 
 -- 3. PLANS TABLE -- Defines membership types (Monthly, Quarterly, Annual) [cite: 139] 
CREATE TABLE Plans ( 
    PlanID INT PRIMARY KEY IDENTITY(1,1), 
    PlanName VARCHAR(50) NOT NULL, 
    Price DECIMAL(10,2) NOT NULL, -- Use LaTeX format in docs: $$ \text{Price} $$ 
    DurationDays INT NOT NULL,
    Status CHAR(1) DEFAULT 'A' -- 'A' for Active, 'I' for Inactive
); 
 -- 4. SUBSCRIPTIONS TABLE -- Links members to their specific active plans [cite: 138] 
CREATE TABLE Subscriptions ( 
    SubscriptionID INT PRIMARY KEY IDENTITY(1,1), 
    UserID INT, 
    PlanID INT, 
    StartDate DATE NOT NULL, 
    EndDate DATE NOT NULL, 
    PaymentStatus CHAR(1) DEFAULT 'U', -- 'P' for Paid, 'U' for Unpaid 
    FOREIGN KEY (UserID) REFERENCES Users(UserID), 
    FOREIGN KEY (PlanID) REFERENCES Plans(PlanID) 
); 
 -- 5. ROUTINES TABLE -- Core module for sports planning and load variables [cite: 121, 153] 
CREATE TABLE Routines ( 
    RoutineID INT PRIMARY KEY IDENTITY(1,1), 
    UserID INT, -- The Member 
    CoachID INT, -- The User/Staff who created it [cite: 151] 
    RoutineName VARCHAR(100), 
    Goal VARCHAR(255), -- e.g., Weight Loss, Hypertrophy 
    Status CHAR(1) DEFAULT 'A', -- 'A' for Active, 'I' for Archived 
    AssignedAt DATETIME DEFAULT GETDATE(), 
    FOREIGN KEY (UserID) REFERENCES Users(UserID), 
    FOREIGN KEY (CoachID) REFERENCES Users(UserID) 
); 
 -- 6. ATTENDANCE TABLE -- Real-time validation for gym entry [cite: 146, 147] 
CREATE TABLE Attendance ( 
    AttendanceID INT PRIMARY KEY IDENTITY(1,1), 
    UserID INT, 
    CheckInTime DATETIME DEFAULT GETDATE(), 
    FOREIGN KEY (UserID) REFERENCES Users(UserID) 
);
-- 7. NOTIFICATIONS TABLE -- Almacena alertas de vencimiento, renovaciones y del sistema
CREATE TABLE Notifications ( 
    NotificationID INT PRIMARY KEY IDENTITY(1,1), 
    UserID INT, -- El usuario (socio o admin) que recibe la notificación
    Title VARCHAR(100) NOT NULL,
    Message VARCHAR(255) NOT NULL, 
    Type VARCHAR(50), -- Ej: 'Vencimiento', 'Renovacion', 'Sistema'
    IsRead BIT DEFAULT 0, -- 0 (Falso) para no leída, 1 (Verdadero) para leída
    CreatedAt DATETIME DEFAULT GETDATE(), 
    FOREIGN KEY (UserID) REFERENCES Users(UserID) 
);
-- 8. PAYMENTS TABLE -- Historial de transacciones con soporte para comprobantes
CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY IDENTITY(1,1),
    SubscriptionID INT, 
    AmountPaid DECIMAL(10,2) NOT NULL,
    PaymentDate DATETIME DEFAULT GETDATE(),
    PaymentMethod VARCHAR(50), -- Ej: 'Efectivo', 'Tarjeta', 'Transferencia'
    ReferenceNumber VARCHAR(100), -- Número de comprobante o documento del banco
    ReceiptUrl VARCHAR(500), -- AQUÍ VA EL LINK DE LA FOTO DEL COMPROBANTE
    Status CHAR(1) DEFAULT 'P', -- 'P' para Pendiente de revisión, 'A' para Aprobado
    FOREIGN KEY (SubscriptionID) REFERENCES Subscriptions(SubscriptionID)
);

-- 9. COACH_PERMISSIONS TABLE -- Advanced permissions for coaches
CREATE TABLE CoachPermissions (
    PermissionID INT PRIMARY KEY IDENTITY(1,1),
    CoachID INT UNIQUE,
    CanEditOthersRoutines BIT DEFAULT 0,
    FOREIGN KEY (CoachID) REFERENCES Users(UserID)
);

-- 10. COACH_ASSIGNMENTS TABLE -- Assign members to a specific coach
CREATE TABLE CoachAssignments (
    AssignmentID INT PRIMARY KEY IDENTITY(1,1),
    CoachID INT,
    MemberID INT UNIQUE,
    AssignedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CoachID) REFERENCES Users(UserID),
    FOREIGN KEY (MemberID) REFERENCES Users(UserID)
);
CREATE TABLE dbo.Classes (
    ClassID INT IDENTITY(1,1) PRIMARY KEY,
    ClassName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Capacity INT NOT NULL, -- Límite de aforo
    Status CHAR(1) DEFAULT 'A'
);

-- Tabla: ClassSchedules (Agenda semanal de las clases)
CREATE TABLE dbo.ClassSchedules (
    ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
    ClassID INT NOT NULL,
    CoachID INT NOT NULL, -- El entrenador asignado a dictarla
    DayOfWeek NVARCHAR(15) NOT NULL, -- Ej: 'Monday', 'Tuesday'
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    Status CHAR(1) DEFAULT 'A',
    CONSTRAINT FK_ClassSchedules_Classes FOREIGN KEY (ClassID) REFERENCES dbo.Classes(ClassID),
    CONSTRAINT FK_ClassSchedules_Coach FOREIGN KEY (CoachID) REFERENCES dbo.Users(UserID)
);

-- Tabla: ClassReservations (Control de aforo por alumno)
CREATE TABLE dbo.ClassReservations (
    ReservationID INT IDENTITY(1,1) PRIMARY KEY,
    ScheduleID INT NOT NULL,
    UserID INT NOT NULL, -- El alumno que reserva
    ReservationDate DATE NOT NULL,
    Status CHAR(1) DEFAULT 'A', -- 'A' = Activa, 'C' = Cancelada
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_ClassReservations_Schedule FOREIGN KEY (ScheduleID) REFERENCES dbo.ClassSchedules(ScheduleID),
    CONSTRAINT FK_ClassReservations_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);

-- Tabla: PhysicalEvaluations (Historial antropométrico)
CREATE TABLE dbo.PhysicalEvaluations (
    EvaluationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL, -- El alumno
    CoachID INT NOT NULL, -- El entrenador que evalúa
    EvaluationDate DATE NOT NULL DEFAULT GETDATE(),
    WeightKg DECIMAL(5,2) NOT NULL,
    BodyFatPercentage DECIMAL(5,2),
    ChestPerimeter DECIMAL(5,2),
    WaistPerimeter DECIMAL(5,2),
    Notes NVARCHAR(500),
    CONSTRAINT FK_PhysicalEvals_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_PhysicalEvals_Coach FOREIGN KEY (CoachID) REFERENCES dbo.Users(UserID)
);