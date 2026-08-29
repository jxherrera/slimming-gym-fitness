-- ==============================================================================
-- MIGRACIÓN: Tablas que la API usa y no estaban versionadas
-- ==============================================================================
--
-- El esquema de `schema/01_schema.sql` define 9 tablas, pero la API consulta 21.
-- Las que faltan existían solo en la base original de Google Cloud y nunca se
-- llevaron al repositorio, así que cualquier instalación nueva (la VM, por
-- ejemplo) arranca sin ellas: la pantalla de horarios responde
-- "Invalid object name 'CoachWorkHours'" y lo mismo ocurre con clases,
-- plantillas, evaluaciones y entrenamientos.
--
-- La definición de cada columna se dedujo de las consultas de los controladores
-- que ya están en producción, respetando nombres y tipos exactos:
--
--   CoachWorkHours          scheduleController.js, classController.js
--   Classes                 classController.js
--   ClassReservations       classController.js
--   ExerciseCatalog         templateController.js
--   RoutineTemplates        templateController.js
--   RoutineTemplateExercises  templateController.js
--   RoutineExercises        routineController.js
--   PhysicalEvaluations     evaluationController.js
--   WorkoutSessions         workoutController.js
--   WorkoutSessionDetails   workoutController.js
--   EmailLogs               services/emailService.js
--   AuditLogs               services/userService.js
--
-- Es idempotente: cada bloque comprueba si el objeto existe antes de crearlo,
-- de modo que puede aplicarse sobre una base a medias sin romper nada.
--
-- Ejecución:
--   sqlcmd -S localhost -U sa -P '<clave>' -d GymDatabase -C -f 65001 \
--          -i 20260810_tablas_faltantes.sql
-- ==============================================================================

SET NOCOUNT ON;
GO

IF DB_NAME() NOT LIKE '%Gym%'
BEGIN
    PRINT 'AVISO: la base seleccionada es ' + DB_NAME() + '. Verifica el parametro -d.';
END
GO

-- ------------------------------------------------------------------------------
-- 1. Horario laboral de los entrenadores
--
-- StartTime y EndTime son TIME y no texto: scheduleController los lee con
-- CONVERT(varchar(5), StartTime, 108), un estilo que solo tiene sentido sobre un
-- tipo de hora real. Las comparaciones que hace classController contra cadenas
-- 'HH:mm' siguen funcionando por conversión implícita.
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.CoachWorkHours', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CoachWorkHours (
        ID        INT PRIMARY KEY IDENTITY(1,1),
        CoachID   INT NOT NULL,
        DayOfWeek VARCHAR(20) NOT NULL,   -- 'Lunes' ... 'Domingo', como los escribe la app
        StartTime TIME NOT NULL,
        EndTime   TIME NOT NULL,
        CONSTRAINT FK_CoachWorkHours_Users FOREIGN KEY (CoachID) REFERENCES dbo.Users(UserID)
    );

    CREATE INDEX IX_CoachWorkHours_CoachID ON dbo.CoachWorkHours(CoachID);
    PRINT 'Tabla CoachWorkHours creada.';
END
GO

-- ------------------------------------------------------------------------------
-- 2. Clases grupales
--
-- CoachID admite NULL: getAllClasses usa LEFT JOIN y muestra "No asignado"
-- cuando la clase todavía no tiene entrenador.
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.Classes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Classes (
        ClassID     INT PRIMARY KEY IDENTITY(1,1),
        ClassName   NVARCHAR(150) NOT NULL,
        CoachID     INT NULL,
        StartTime   DATETIME NOT NULL,
        EndTime     DATETIME NOT NULL,
        MaxCapacity INT NOT NULL DEFAULT 0,
        Description NVARCHAR(500) NULL,
        CONSTRAINT FK_Classes_Users FOREIGN KEY (CoachID) REFERENCES dbo.Users(UserID)
    );

    -- La cartelera se consulta siempre por rango de fechas.
    CREATE INDEX IX_Classes_StartTime ON dbo.Classes(StartTime);
    CREATE INDEX IX_Classes_CoachID ON dbo.Classes(CoachID);
    PRINT 'Tabla Classes creada.';
END
GO

-- ------------------------------------------------------------------------------
-- 3. Reservas de clases
--
-- La restricción única refuerza en la base lo que classController ya comprueba
-- antes de insertar: un socio no puede reservar dos veces la misma clase.
--
-- El borrado en cascada va solo hacia Classes. Si también cascadeara hacia
-- Users, SQL Server rechazaría la tabla por tener dos rutas de borrado hacia
-- Users (una directa y otra a través de Classes); userService ya borra estas
-- filas a mano antes de eliminar un usuario.
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.ClassReservations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ClassReservations (
        ReservationID INT PRIMARY KEY IDENTITY(1,1),
        ClassID       INT NOT NULL,
        UserID        INT NOT NULL,
        -- El nombre lo fija classController.getUserReservations, que lee
        -- cr.ReservedAt. No es un capricho: con otro nombre esa consulta
        -- devuelve error 207 y la agenda del socio no carga.
        ReservedAt    DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_ClassReservations_Classes FOREIGN KEY (ClassID)
            REFERENCES dbo.Classes(ClassID) ON DELETE CASCADE,
        CONSTRAINT FK_ClassReservations_Users FOREIGN KEY (UserID)
            REFERENCES dbo.Users(UserID),
        CONSTRAINT UQ_ClassReservations_Clase_Socio UNIQUE (ClassID, UserID)
    );

    CREATE INDEX IX_ClassReservations_UserID ON dbo.ClassReservations(UserID);
    PRINT 'Tabla ClassReservations creada.';
END
GO

-- ------------------------------------------------------------------------------
-- 4. Catálogo de ejercicios
--
-- Name es único: templateController rechaza duplicados antes de insertar y de
-- actualizar, así que la base debe sostener esa misma regla.
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.ExerciseCatalog', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ExerciseCatalog (
        ExerciseID  INT PRIMARY KEY IDENTITY(1,1),
        Name        NVARCHAR(150) NOT NULL,
        MuscleGroup NVARCHAR(100) NULL,
        Description NVARCHAR(MAX) NULL,
        CONSTRAINT UQ_ExerciseCatalog_Name UNIQUE (Name)
    );
    PRINT 'Tabla ExerciseCatalog creada.';
END
GO

-- ------------------------------------------------------------------------------
-- 5. Plantillas de rutina
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.RoutineTemplates', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.RoutineTemplates (
        TemplateID   INT PRIMARY KEY IDENTITY(1,1),
        CoachID      INT NOT NULL,
        TemplateName NVARCHAR(150) NOT NULL,
        Goal         NVARCHAR(255) NULL,
        CreatedAt    DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_RoutineTemplates_Users FOREIGN KEY (CoachID) REFERENCES dbo.Users(UserID)
    );

    CREATE INDEX IX_RoutineTemplates_CoachID ON dbo.RoutineTemplates(CoachID);
    PRINT 'Tabla RoutineTemplates creada.';
END
GO

IF OBJECT_ID('dbo.RoutineTemplateExercises', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.RoutineTemplateExercises (
        TemplateExerciseID INT PRIMARY KEY IDENTITY(1,1),
        TemplateID         INT NOT NULL,
        ExerciseName       NVARCHAR(150) NOT NULL,
        Sets               INT NULL,
        Reps               INT NULL,
        Weight             DECIMAL(5,2) NULL,
        DayOfWeek          NVARCHAR(20) NULL,
        CONSTRAINT FK_RoutineTemplateExercises_Templates FOREIGN KEY (TemplateID)
            REFERENCES dbo.RoutineTemplates(TemplateID) ON DELETE CASCADE
    );

    CREATE INDEX IX_RoutineTemplateExercises_TemplateID ON dbo.RoutineTemplateExercises(TemplateID);
    PRINT 'Tabla RoutineTemplateExercises creada.';
END
GO

-- ------------------------------------------------------------------------------
-- 6. Ejercicios de las rutinas asignadas
--
-- La PK se llama ExerciseID porque así la lee routineController al devolver los
-- ejercicios de una rutina. No es una referencia a ExerciseCatalog: el nombre
-- del ejercicio se guarda como texto y el catálogo solo sirve de sugerencia en
-- el formulario.
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.RoutineExercises', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.RoutineExercises (
        ExerciseID   INT PRIMARY KEY IDENTITY(1,1),
        RoutineID    INT NOT NULL,
        ExerciseName NVARCHAR(150) NOT NULL,
        Sets         INT NULL,
        Reps         INT NULL,
        Weight       DECIMAL(5,2) NULL,
        DayOfWeek    NVARCHAR(20) NULL,
        CONSTRAINT FK_RoutineExercises_Routines FOREIGN KEY (RoutineID)
            REFERENCES dbo.Routines(RoutineID) ON DELETE CASCADE
    );

    CREATE INDEX IX_RoutineExercises_RoutineID ON dbo.RoutineExercises(RoutineID);
    PRINT 'Tabla RoutineExercises creada.';
END
GO

-- ------------------------------------------------------------------------------
-- 7. Evaluaciones físicas
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.PhysicalEvaluations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PhysicalEvaluations (
        EvaluationID         INT PRIMARY KEY IDENTITY(1,1),
        UserID               INT NOT NULL,
        CoachID              INT NULL,
        WeightKg             DECIMAL(5,2) NULL,
        BodyFatPercentage    DECIMAL(5,2) NULL,
        MuscleMassPercentage DECIMAL(5,2) NULL,
        EvaluationDate       DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_PhysicalEvaluations_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
        CONSTRAINT FK_PhysicalEvaluations_Coach FOREIGN KEY (CoachID) REFERENCES dbo.Users(UserID)
    );

    -- El historial se pide por socio y en orden cronológico descendente.
    CREATE INDEX IX_PhysicalEvaluations_UserID_Fecha
        ON dbo.PhysicalEvaluations(UserID, EvaluationDate DESC);
    PRINT 'Tabla PhysicalEvaluations creada.';
END
GO

-- ------------------------------------------------------------------------------
-- 8. Entrenamientos completados
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.WorkoutSessions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.WorkoutSessions (
        SessionID               INT PRIMARY KEY IDENTITY(1,1),
        UserID                  INT NOT NULL,
        RoutineID               INT NULL,   -- una sesión libre no parte de ninguna rutina
        CompletedAt             DATETIME NOT NULL DEFAULT GETDATE(),
        TotalExercisesCompleted INT NULL,
        CONSTRAINT FK_WorkoutSessions_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
        CONSTRAINT FK_WorkoutSessions_Routines FOREIGN KEY (RoutineID) REFERENCES dbo.Routines(RoutineID)
    );

    CREATE INDEX IX_WorkoutSessions_UserID_Fecha ON dbo.WorkoutSessions(UserID, CompletedAt DESC);
    PRINT 'Tabla WorkoutSessions creada.';
END
GO

IF OBJECT_ID('dbo.WorkoutSessionDetails', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.WorkoutSessionDetails (
        DetailID      INT PRIMARY KEY IDENTITY(1,1),
        SessionID     INT NOT NULL,
        ExerciseName  NVARCHAR(150) NOT NULL,
        SetsCompleted INT NULL,
        RepsCompleted INT NULL,
        WeightUsed    DECIMAL(10,2) NULL,
        CONSTRAINT FK_WorkoutSessionDetails_Sessions FOREIGN KEY (SessionID)
            REFERENCES dbo.WorkoutSessions(SessionID) ON DELETE CASCADE
    );

    CREATE INDEX IX_WorkoutSessionDetails_SessionID ON dbo.WorkoutSessionDetails(SessionID);
    PRINT 'Tabla WorkoutSessionDetails creada.';
END
GO

-- ------------------------------------------------------------------------------
-- 9. Bitácora de correos
--
-- emailService escribe aquí un registro por envío, con Status 'Éxito', 'Fallo'
-- o 'Pendiente'. No se restringe con un CHECK porque el servicio podría añadir
-- estados nuevos y un fallo de registro no debe tumbar el envío.
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.EmailLogs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EmailLogs (
        EmailLogID INT PRIMARY KEY IDENTITY(1,1),
        UserID     INT NULL,
        EmailType  VARCHAR(50) NULL,
        Status     VARCHAR(20) NULL,
        SentAt     DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_EmailLogs_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
    );

    CREATE INDEX IX_EmailLogs_UserID ON dbo.EmailLogs(UserID);
    PRINT 'Tabla EmailLogs creada.';
END
GO

-- ------------------------------------------------------------------------------
-- 10. Auditoría
--
-- La escriben los triggers de la base, no la aplicación; el backend solo la
-- consulta y borra sus filas al eliminar un usuario (userService.js). Se crea
-- para que ese borrado no falle. ChangedByUserID queda sin llave foránea a
-- propósito: la bitácora debe sobrevivir a la baja del usuario que hizo el
-- cambio, que es justamente lo que se audita.
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditLogs (
        AuditID         INT PRIMARY KEY IDENTITY(1,1),
        TableName       VARCHAR(100) NOT NULL,
        EntityID        INT NULL,
        Action          VARCHAR(20) NULL,       -- INSERT, UPDATE, DELETE
        ChangedByUserID INT NULL,
        OldValue        NVARCHAR(MAX) NULL,
        NewValue        NVARCHAR(MAX) NULL,
        ChangedAt       DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_AuditLogs_Tabla_Entidad ON dbo.AuditLogs(TableName, EntityID);
    PRINT 'Tabla AuditLogs creada.';
END
GO

-- ------------------------------------------------------------------------------
-- 11. Columna de auditoría en Payments
--
-- paymentController la escribe al aprobar o rechazar un comprobante: guarda qué
-- administrador lo revisó, y NULL cuando la aprobación vino del webhook
-- automático. Sin ella, aprobar un pago falla.
-- ------------------------------------------------------------------------------
IF COL_LENGTH('dbo.Payments', 'LastModifiedBy') IS NULL
BEGIN
    ALTER TABLE dbo.Payments ADD LastModifiedBy INT NULL;
    PRINT 'Columna Payments.LastModifiedBy agregada.';
END
GO

-- ------------------------------------------------------------------------------
-- 12. Correccion: ClassReservations.ReservedAt
--
-- La primera version de esta migracion creo la columna como ReservationDate.
-- Las bases que ya la aplicaron necesitan el cambio de nombre; las nuevas la
-- crean bien desde el principio y este bloque no hace nada.
-- ------------------------------------------------------------------------------
IF COL_LENGTH('dbo.ClassReservations', 'ReservedAt') IS NULL
   AND COL_LENGTH('dbo.ClassReservations', 'ReservationDate') IS NOT NULL
BEGIN
    EXEC sp_rename 'dbo.ClassReservations.ReservationDate', 'ReservedAt', 'COLUMN';
    PRINT 'Columna ClassReservations.ReservationDate renombrada a ReservedAt.';
END
GO

-- ------------------------------------------------------------------------------
-- 13. Rol Guest
--
-- seedRunner.js contempla cuatro roles. Si falta alguno, el alta de usuarios con
-- ese perfil se queda sin RoleID.
-- ------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Guest')
BEGIN
    INSERT INTO dbo.Roles (RoleName) VALUES ('Guest');
    PRINT 'Rol Guest agregado.';
END
GO

-- ------------------------------------------------------------------------------
-- Verificación
-- ------------------------------------------------------------------------------
SELECT t.name AS Tabla, SUM(p.rows) AS Filas
FROM sys.tables t
JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0, 1)
GROUP BY t.name
ORDER BY t.name;
GO

PRINT 'Migracion completada.';
GO
