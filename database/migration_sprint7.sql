USE [GymDatabase]; 
GO

CREATE TABLE WorkoutSessions (
    SessionID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    RoutineID INT NULL, 
    CompletedAt DATETIME DEFAULT GETDATE(),
    TotalExercisesCompleted INT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RoutineID) REFERENCES Routines(RoutineID)
);
GO

CREATE TABLE WorkoutSessionDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SessionID INT NOT NULL,
    ExerciseName VARCHAR(150) NOT NULL,
    SetsCompleted INT NOT NULL,
    RepsCompleted INT NOT NULL,
    WeightUsed DECIMAL(10,2) NULL, 
    FOREIGN KEY (SessionID) REFERENCES WorkoutSessions(SessionID) ON DELETE CASCADE
);
GO
