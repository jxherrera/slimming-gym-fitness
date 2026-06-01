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
    DurationDays INT NOT NULL 
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