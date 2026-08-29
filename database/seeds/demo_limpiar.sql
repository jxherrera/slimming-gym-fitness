-- ============================================================================
-- BORRADO DE LOS DATOS DE DEMOSTRACION - SLIMMING GYM FITNESS
--
-- Generado por backend-gimnasio/scripts/generar-dataset-sql.js
--
-- Borra unicamente los usuarios con correo @demo.slimminggym.com y todo lo que
-- cuelga de ellos. Ningun socio real se ve afectado.
--
--   sqlcmd -S localhost -U sa -P '<clave>' -d GymDatabase -C -f 65001 -i demo_limpiar.sql
-- ============================================================================

SET NOCOUNT ON;
GO

IF OBJECT_ID('dbo.AuditLogs','U') IS NOT NULL
   AND COL_LENGTH('dbo.AuditLogs','TableName') IS NOT NULL
   AND COL_LENGTH('dbo.AuditLogs','EntityID') IS NOT NULL
BEGIN
    EXEC sp_executesql N'
        DELETE FROM dbo.AuditLogs
        WHERE TableName = ''Payments''
          AND EntityID IN (SELECT p.PaymentID FROM dbo.Payments p
                           JOIN dbo.Subscriptions s ON s.SubscriptionID = p.SubscriptionID
                           WHERE s.UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE ''%@demo.slimminggym.com''));';
END
GO
IF OBJECT_ID('dbo.WorkoutSessionDetails','U') IS NOT NULL AND OBJECT_ID('dbo.WorkoutSessions','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.WorkoutSessionDetails
    WHERE SessionID IN (SELECT SessionID FROM dbo.WorkoutSessions WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com'));
END
GO
IF OBJECT_ID('dbo.WorkoutSessions','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.WorkoutSessions WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
IF OBJECT_ID('dbo.RoutineExercises','U') IS NOT NULL AND OBJECT_ID('dbo.Routines','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.RoutineExercises
    WHERE RoutineID IN (SELECT RoutineID FROM dbo.Routines WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com') OR CoachID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com'));
END
GO
IF OBJECT_ID('dbo.Routines','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.Routines WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com') OR CoachID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
IF OBJECT_ID('dbo.RoutineTemplateExercises','U') IS NOT NULL AND OBJECT_ID('dbo.RoutineTemplates','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.RoutineTemplateExercises
    WHERE TemplateID IN (SELECT TemplateID FROM dbo.RoutineTemplates WHERE CoachID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com'));
END
GO
IF OBJECT_ID('dbo.RoutineTemplates','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.RoutineTemplates WHERE CoachID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
IF OBJECT_ID('dbo.ClassReservations','U') IS NOT NULL AND OBJECT_ID('dbo.Classes','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.ClassReservations
    WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com')
       OR ClassID IN (SELECT ClassID FROM dbo.Classes WHERE CoachID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com'));
END
GO
IF OBJECT_ID('dbo.Classes','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.Classes WHERE CoachID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
IF OBJECT_ID('dbo.CoachWorkHours','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.CoachWorkHours WHERE CoachID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
IF OBJECT_ID('dbo.PhysicalEvaluations','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.PhysicalEvaluations
    WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com') OR CoachID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
IF OBJECT_ID('dbo.Payments','U') IS NOT NULL AND OBJECT_ID('dbo.Subscriptions','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.Payments
    WHERE SubscriptionID IN (SELECT SubscriptionID FROM dbo.Subscriptions WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com'));
END
GO
IF OBJECT_ID('dbo.Subscriptions','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.Subscriptions WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
IF OBJECT_ID('dbo.CoachAssignments','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.CoachAssignments
    WHERE CoachID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com') OR MemberID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
IF OBJECT_ID('dbo.CoachPermissions','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.CoachPermissions WHERE CoachID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
IF OBJECT_ID('dbo.EmailLogs','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.EmailLogs WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
IF OBJECT_ID('dbo.Attendance','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.Attendance WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
IF OBJECT_ID('dbo.Notifications','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.Notifications WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
IF OBJECT_ID('dbo.PasswordResetTokens','U') IS NOT NULL AND OBJECT_ID('dbo.Users','U') IS NOT NULL
BEGIN
    DELETE FROM dbo.PasswordResetTokens WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com');
END
GO
DELETE FROM dbo.Users WHERE Email LIKE '%@demo.slimminggym.com';
GO

PRINT 'Datos de demostracion eliminados.';
GO
