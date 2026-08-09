-- =============================================================
-- SCRIPT DE DATOS MAESTROS (SEEDERS) PARA SLIMMING GYM FITNESS
-- Permite carga de datos iniciales de forma 100% Idempotente
-- =============================================================

USE [slimming_gym_db]; -- O cambiar al nombre de tu BD en SQL Server
GO

-- 1. SEED DE ROLES SISTEMA
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Guest')
    INSERT INTO dbo.Roles (RoleName) VALUES ('Guest');

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Admin')
    INSERT INTO dbo.Roles (RoleName) VALUES ('Admin');

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Member')
    INSERT INTO dbo.Roles (RoleName) VALUES ('Member');

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Coach')
    INSERT INTO dbo.Roles (RoleName) VALUES ('Coach');

PRINT 'Seeders de Roles completados correctamente.';

-- 2. SEED DE LOS 3 PLANES BASE DE SUSCRIPCIÓN
IF NOT EXISTS (SELECT 1 FROM dbo.Plans WHERE PlanName = 'Plan Básico (Mensual)')
    INSERT INTO dbo.Plans (PlanName, Price, DurationDays, Status) 
    VALUES ('Plan Básico (Mensual)', 29.99, 30, 'A');

IF NOT EXISTS (SELECT 1 FROM dbo.Plans WHERE PlanName = 'Plan Pro (Trimestral)')
    INSERT INTO dbo.Plans (PlanName, Price, DurationDays, Status) 
    VALUES ('Plan Pro (Trimestral)', 79.99, 90, 'A');

IF NOT EXISTS (SELECT 1 FROM dbo.Plans WHERE PlanName = 'Plan VIP (Anual)')
    INSERT INTO dbo.Plans (PlanName, Price, DurationDays, Status) 
    VALUES ('Plan VIP (Anual)', 279.99, 365, 'A');

PRINT 'Seeders de los 3 Planes de Suscripción completados correctamente.';

-- 3. SEED DE SUPERUSUARIO (ADMINISTRADOR MAESTRO)
DECLARE @AdminRoleID INT;
SELECT @AdminRoleID = RoleID FROM dbo.Roles WHERE RoleName = 'Admin';

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = 'admin@slimminggym.com' OR Email = 'admin@admin.com')
BEGIN
    INSERT INTO dbo.Users (
        IDNumber, FirstName, LastName, Email, PasswordHash, PhoneNumber, RoleID, Status, CreatedAt
    )
    VALUES (
        '0000000000', 'Super', 'Admin', 'admin@slimminggym.com',
        '$2b$10$lLp0rtXG6r/HL3vx1oRlJu71Jwcv/pR7ZFG/sfuDXFHifERmBmt52', -- Pass: admin123
        '0999999999', @AdminRoleID, 'A', GETDATE()
    );
    PRINT 'Superusuario Admin creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'El Superusuario ya existe en la Base de Datos.';
END

-- 4. VERIFICACIÓN FINAL
SELECT RoleID, RoleName FROM dbo.Roles;
SELECT PlanID, PlanName, Price, DurationDays, Status FROM dbo.Plans;
SELECT UserID, IDNumber, FirstName, LastName, Email, RoleID, Status FROM dbo.Users WHERE RoleID = @AdminRoleID;