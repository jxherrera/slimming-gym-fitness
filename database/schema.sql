CREATE TABLE Roles ( 
    RoleID INT PRIMARY KEY IDENTITY(1,1), 
    RoleName VARCHAR(50) NOT NULL 
); 

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
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) 
); 

CREATE TABLE Plans ( 
    PlanID INT PRIMARY KEY IDENTITY(1,1), 
    PlanName VARCHAR(50) NOT NULL, 
    Price DECIMAL(10,2) NOT NULL, 
    DurationDays INT NOT NULL,
    Status CHAR(1) DEFAULT 'A' 
); 

CREATE TABLE Subscriptions ( 
    SubscriptionID INT PRIMARY KEY IDENTITY(1,1), 
    UserID INT, 
    PlanID INT, 
    StartDate DATE NOT NULL, 
    EndDate DATE NOT NULL, 
    PaymentStatus CHAR(1) DEFAULT 'U', 
    FOREIGN KEY (UserID) REFERENCES Users(UserID), 
    FOREIGN KEY (PlanID) REFERENCES Plans(PlanID) 
); 

CREATE TABLE Routines ( 
    RoutineID INT PRIMARY KEY IDENTITY(1,1), 
    UserID INT, 
    CoachID INT,
    RoutineName VARCHAR(100), 
    Goal VARCHAR(255),
    Status CHAR(1) DEFAULT 'A',  
    AssignedAt DATETIME DEFAULT GETDATE(), 
    FOREIGN KEY (UserID) REFERENCES Users(UserID), 
    FOREIGN KEY (CoachID) REFERENCES Users(UserID) 
); 

CREATE TABLE Attendance ( 
    AttendanceID INT PRIMARY KEY IDENTITY(1,1), 
    UserID INT, 
    CheckInTime DATETIME DEFAULT GETDATE(), 
    FOREIGN KEY (UserID) REFERENCES Users(UserID) 
);

CREATE TABLE Notifications ( 
    NotificationID INT PRIMARY KEY IDENTITY(1,1), 
    UserID INT, 
    Title VARCHAR(100) NOT NULL,
    Message VARCHAR(255) NOT NULL, 
    Type VARCHAR(50), 
    IsRead BIT DEFAULT 0, 
    CreatedAt DATETIME DEFAULT GETDATE(), 
    FOREIGN KEY (UserID) REFERENCES Users(UserID) 
);

CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY IDENTITY(1,1),
    SubscriptionID INT, 
    AmountPaid DECIMAL(10,2) NOT NULL,
    PaymentDate DATETIME DEFAULT GETDATE(),
    PaymentMethod VARCHAR(50), 
    ReferenceNumber VARCHAR(100), 
    ReceiptUrl VARCHAR(500), 
    Status CHAR(1) DEFAULT 'P', 
    FOREIGN KEY (SubscriptionID) REFERENCES Subscriptions(SubscriptionID)
);

CREATE TABLE CoachPermissions (
    PermissionID INT PRIMARY KEY IDENTITY(1,1),
    CoachID INT UNIQUE,
    CanEditOthersRoutines BIT DEFAULT 0,
    CanManagePlans BIT DEFAULT 0,
    CanSendMessages BIT DEFAULT 0,
    FOREIGN KEY (CoachID) REFERENCES Users(UserID)
);

CREATE TABLE CoachAssignments (
    AssignmentID INT PRIMARY KEY IDENTITY(1,1),
    CoachID INT,
    MemberID INT UNIQUE,
    AssignedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CoachID) REFERENCES Users(UserID),
    FOREIGN KEY (MemberID) REFERENCES Users(UserID)
);