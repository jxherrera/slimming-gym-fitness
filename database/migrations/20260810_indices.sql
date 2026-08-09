-- ==============================================================================
-- MIGRACIÓN: Creación de Índices para Rendimiento
-- ==============================================================================

USE [GymDatabase];
GO

-- 1. Acelera las consultas de usuarios activos en expirationChecker y el panel admin
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Subscriptions_UserID_EndDate' AND object_id = OBJECT_ID('Subscriptions'))
BEGIN
    CREATE INDEX IX_Subscriptions_UserID_EndDate ON Subscriptions(UserID, EndDate DESC);
END
GO

-- 2. Acelera la búsqueda de vencimientos basados en pagos pendientes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Subscriptions_PaymentStatus_EndDate' AND object_id = OBJECT_ID('Subscriptions'))
BEGIN
    CREATE INDEX IX_Subscriptions_PaymentStatus_EndDate ON Subscriptions(PaymentStatus, EndDate);
END
GO

-- 3. Vital para recepción (filtra asistencias por fecha, endpoint GET /api/attendance/today)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Attendance_CheckInTime' AND object_id = OBJECT_ID('Attendance'))
BEGIN
    CREATE INDEX IX_Attendance_CheckInTime ON Attendance(CheckInTime);
END
GO

-- 4. Acelera búsquedas de usuarios por cédula (login o búsquedas en panel admin)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_IDNumber' AND object_id = OBJECT_ID('Users'))
BEGIN
    CREATE INDEX IX_Users_IDNumber ON Users(IDNumber);
END
GO

-- 5. Acelera filtrado de pagos por estado (dashboard admin: pagos pendientes vs aprobados)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payments_Status' AND object_id = OBJECT_ID('Payments'))
BEGIN
    CREATE INDEX IX_Payments_Status ON Payments(Status);
END
GO

-- 6. Actualización de Claves Foráneas (ON DELETE CASCADE)
-- Se eliminan las foráneas actuales y se recrean con CASCADE para Attendance y Notifications
ALTER TABLE Attendance DROP CONSTRAINT FK_Attendance_Users;
ALTER TABLE Attendance ADD CONSTRAINT FK_Attendance_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE;

ALTER TABLE Notifications DROP CONSTRAINT FK_Notifications_Users;
ALTER TABLE Notifications ADD CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE;
GO
