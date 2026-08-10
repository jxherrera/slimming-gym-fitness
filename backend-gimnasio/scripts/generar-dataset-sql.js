/**
 * Genera el dataset de demostracion como un script SQL autonomo.
 *
 *   node scripts/generar-dataset-sql.js
 *   -> database/seeds/demo_dataset.sql
 *   -> database/seeds/demo_limpiar.sql
 *
 * Por que existe: para poblar la base de la VM no siempre se puede correr Node
 * (hay que copiar el proyecto, instalar dependencias y tener el .env). Con un
 * .sql basta con subirlo por scp y pasarlo a sqlcmd.
 *
 * Como funciona: NO reimplementa la generacion. Ejecuta seeders/demoDataSeeder.js
 * contra un pool simulado que, en lugar de hablar con SQL Server, se queda con
 * cada INSERT y sus valores. Despues traduce esas filas a SQL. De esa forma el
 * .sql y `npm run seed:demo` producen exactamente los mismos datos, y la logica
 * vive en un solo lugar.
 *
 * Las llaves foraneas del .sql no usan los IDs capturados (que dependen del
 * IDENTITY de cada base) sino claves naturales resueltas con JOIN: el correo del
 * usuario, el nombre del plan, la fecha de inicio de la suscripcion. Asi el
 * script funciona en cualquier base, tenga los IDs que tenga.
 */

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const RUTA_DB = path.join(__dirname, '..', 'config', 'db.js');
const DESTINO = path.join(RAIZ, 'database', 'seeds');

const { DOMINIO_DEMO, PASSWORD_DEMO } = require('../seeders/demoData');

// ============================================================================
// 1. Pool simulado: captura los INSERT en lugar de ejecutarlos
// ============================================================================

// Se declaran todas como existentes para que el dataset incluya cada seccion.
// El .sql resultante comprueba por su cuenta, con OBJECT_ID, si la tabla existe
// en la base destino antes de insertar.
const TABLAS = [
    'Roles', 'Users', 'Plans', 'Subscriptions', 'Payments', 'Attendance', 'Notifications',
    'Routines', 'RoutineExercises', 'CoachAssignments', 'CoachPermissions', 'CoachWorkHours',
    'ExerciseCatalog', 'RoutineTemplates', 'RoutineTemplateExercises', 'Classes',
    'ClassReservations', 'PhysicalEvaluations', 'WorkoutSessions', 'WorkoutSessionDetails',
    'EmailLogs', 'PasswordResetTokens'
];

// Planes tal como los crea seeders/seedRunner.js. El dataset los referencia por
// nombre, no por PlanID.
const PLANES = [
    { PlanID: 1, PlanName: 'Plan Básico (Mensual)', Price: 29.99, DurationDays: 30 },
    { PlanID: 2, PlanName: 'Plan Pro (Trimestral)', Price: 79.99, DurationDays: 90 },
    { PlanID: 3, PlanName: 'Plan VIP (Anual)', Price: 279.99, DurationDays: 365 }
];

const ROLES = [
    { RoleID: 1, RoleName: 'Guest' },
    { RoleID: 2, RoleName: 'Admin' },
    { RoleID: 3, RoleName: 'Member' },
    { RoleID: 4, RoleName: 'Coach' }
];

const almacen = {};
const secuencias = {};

const capturar = () => {
    const valores = {};
    const api = {
        input(nombre, tipo, valor) {
            // La firma real es input(nombre, tipo, valor); si solo llegan dos
            // argumentos, el segundo es el valor.
            valores[nombre] = valor === undefined ? tipo : valor;
            return api;
        },
        async query(consulta) {
            const texto = consulta.replace(/\s+/g, ' ').trim();

            if (/INFORMATION_SCHEMA\.TABLES/i.test(texto)) {
                return { recordset: TABLAS.map((t) => ({ TABLE_NAME: t })), rowsAffected: [0] };
            }
            // Payments.LastModifiedBy y PhysicalEvaluations.EvaluationDate: se
            // asumen presentes y el .sql lo verifica con COL_LENGTH.
            if (/INFORMATION_SCHEMA\.COLUMNS/i.test(texto)) {
                return { recordset: [{ Existe: 1 }], rowsAffected: [0] };
            }
            if (/FROM dbo\.Roles/i.test(texto)) {
                return { recordset: ROLES, rowsAffected: [0] };
            }
            if (/FROM dbo\.Plans/i.test(texto)) {
                return { recordset: PLANES, rowsAffected: [0] };
            }
            if (/COUNT\(\*\) AS Total FROM dbo\.Users/i.test(texto)) {
                return { recordset: [{ Total: 0 }], rowsAffected: [0] };
            }
            // Cedula libre y catalogo de ejercicios: base vacia de datos demo.
            if (/SELECT 1 AS Existe FROM dbo\.Users WHERE IDNumber/i.test(texto)) {
                return { recordset: [], rowsAffected: [0] };
            }
            if (/SELECT ExerciseID FROM dbo\.ExerciseCatalog/i.test(texto)) {
                return { recordset: [], rowsAffected: [0] };
            }
            if (/^WITH Demo AS/i.test(texto)) {
                const n = (t) => (almacen[t] || []).length;
                return {
                    recordset: [{
                        Usuarios: n('Users'), Suscripciones: n('Subscriptions'), Pagos: n('Payments'),
                        Asistencias: n('Attendance'), Rutinas: n('Routines'), Notificaciones: n('Notifications')
                    }],
                    rowsAffected: [0]
                };
            }
            if (/^INSERT INTO/i.test(texto)) {
                const tabla = texto.match(/INSERT INTO (?:dbo\.)?(\w+)/i)[1];
                const salida = (texto.match(/OUTPUT INSERTED\.(\w+)/i) || [])[1];
                const fila = { ...valores };

                if (salida) {
                    secuencias[tabla] = (secuencias[tabla] || 0) + 1;
                    fila[salida] = secuencias[tabla];
                }

                (almacen[tabla] = almacen[tabla] || []).push(fila);
                return { recordset: salida ? [{ [salida]: fila[salida] }] : [], rowsAffected: [1] };
            }
            if (/^DELETE|^UPDATE/i.test(texto)) {
                return { recordset: [], rowsAffected: [0] };
            }

            throw new Error('Consulta no prevista por el simulador: ' + texto.slice(0, 120));
        }
    };
    return api;
};

const tipoSimulado = () => ({});
const sqlSimulado = new Proxy({ MAX: -1 }, {
    get: (obj, prop) => (prop in obj ? obj[prop] : tipoSimulado)
});

require.cache[RUTA_DB] = {
    id: RUTA_DB,
    filename: RUTA_DB,
    loaded: true,
    exports: { sql: sqlSimulado, poolPromise: Promise.resolve({ request: capturar }) }
};

const { ejecutar } = require('../seeders/demoDataSeeder');

// ============================================================================
// 2. Utilidades de escritura de SQL
// ============================================================================

// Maximo de filas por constructor VALUES. SQL Server admite 1000; se deja
// holgura para no rozar el limite y para que el archivo siga siendo legible.
const FILAS_POR_LOTE = 250;

/** Literal SQL. Los textos van como N'...' para preservar tildes y ñ. */
const lit = (valor, tipoNulo = 'VARCHAR(200)') => {
    if (valor === null || valor === undefined) return `CAST(NULL AS ${tipoNulo})`;
    if (typeof valor === 'number') return String(valor);
    return `N'${String(valor).replace(/'/g, "''")}'`;
};

const bloque = [];
const escribir = (texto = '') => bloque.push(texto);

/**
 * Emite un INSERT ... SELECT ... FROM (VALUES ...) troceado en lotes, envuelto
 * en la comprobacion de existencia de las tablas que necesita.
 */
const emitir = ({ titulo, requiere = [], cabecera, filas, pie }) => {
    if (filas.length === 0) return;

    const guarda = requiere.map((t) => `OBJECT_ID('dbo.${t}','U') IS NOT NULL`).join(' AND ');

    escribir(`-- ${titulo}: ${filas.length} filas`);

    for (let i = 0; i < filas.length; i += FILAS_POR_LOTE) {
        const lote = filas.slice(i, i + FILAS_POR_LOTE);

        if (guarda) escribir(`IF ${guarda}\nBEGIN`);
        escribir(cabecera);
        escribir(lote.join(',\n'));
        escribir(pie);
        if (guarda) escribir('END');
        escribir('GO');
    }

    escribir();
};

// ============================================================================
// 3. Traduccion de las filas capturadas a SQL
// ============================================================================

const generar = () => {
    // --- Indices para resolver las llaves foraneas por clave natural ---------
    const emailPorUsuario = new Map();
    for (const u of almacen.Users) emailPorUsuario.set(u.UserID, u.Email);

    const rolPorId = Object.fromEntries(ROLES.map((r) => [r.RoleID, r.RoleName]));
    const planPorId = Object.fromEntries(PLANES.map((p) => [p.PlanID, p.PlanName]));

    // Suscripcion -> (correo del socio, fecha de inicio). No hay dos
    // suscripciones del mismo socio que empiecen el mismo dia: el sembrador las
    // encadena sin traslape.
    const suscripcionPorId = new Map();
    for (const s of almacen.Subscriptions) {
        suscripcionPorId.set(s.SubscriptionID, { email: emailPorUsuario.get(s.UserID), inicio: s.StartDate });
    }

    // Rutina -> correo del socio (una rutina activa por socio).
    const rutinaPorId = new Map();
    for (const r of almacen.Routines) rutinaPorId.set(r.RoutineID, emailPorUsuario.get(r.UserID));

    // Plantilla -> (correo del entrenador, nombre de la plantilla).
    const plantillaPorId = new Map();
    for (const t of (almacen.RoutineTemplates || [])) {
        plantillaPorId.set(t.TemplateID, { email: emailPorUsuario.get(t.CoachID), nombre: t.TemplateName });
    }

    // Clase -> (nombre, fecha y hora de inicio).
    const clasePorId = new Map();
    for (const c of (almacen.Classes || [])) {
        clasePorId.set(c.ClassID, { nombre: c.ClassName, inicio: c.StartTime });
    }

    // Sesion -> (correo del socio, momento en que la registro). Si dos sesiones
    // del mismo socio cayeran en el mismo minuto la clave dejaria de ser unica,
    // asi que se separan antes de emitir nada.
    const sesionPorId = new Map();
    const vistas = new Set();
    for (const s of (almacen.WorkoutSessions || [])) {
        let momento = s.CompletedAt;
        const email = emailPorUsuario.get(s.UserID);

        while (vistas.has(`${email}|${momento}`)) {
            const d = new Date(momento.replace(' ', 'T'));
            d.setMinutes(d.getMinutes() + 1);
            momento = d.toISOString().slice(0, 19).replace('T', ' ');
        }

        vistas.add(`${email}|${momento}`);
        s.CompletedAt = momento;
        sesionPorId.set(s.SessionID, { email, momento });
    }

    // --- Cabecera -----------------------------------------------------------
    const generadoEn = new Date().toISOString().slice(0, 10);

    escribir(`-- ============================================================================`);
    escribir(`-- DATOS DE DEMOSTRACION - SLIMMING GYM FITNESS`);
    escribir(`--`);
    escribir(`-- Generado el ${generadoEn} por backend-gimnasio/scripts/generar-dataset-sql.js`);
    escribir(`-- No editar a mano: se regenera desde seeders/demoData.js.`);
    escribir(`--`);
    escribir(`-- Contenido: ${almacen.Users.filter((u) => rolPorId[u.RoleID] === 'Coach').length} entrenadores,`);
    escribir(`-- ${almacen.Users.filter((u) => rolPorId[u.RoleID] === 'Member').length} socios y su operacion de los ultimos meses:`);
    escribir(`-- suscripciones con historial de renovaciones, pagos aprobados y pendientes,`);
    escribir(`-- asistencias, rutinas, plantillas, catalogo de ejercicios, clases grupales`);
    escribir(`-- con reservas, evaluaciones fisicas, notificaciones y bitacora de correos.`);
    escribir(`--`);
    escribir(`-- Requisitos previos: los roles y los 3 planes base deben existir`);
    escribir(`-- (seeders/seedRunner.js o database/seeds/seed.sql).`);
    escribir(`--`);
    escribir(`-- No crea administradores: el unico debe ser el superusuario maestro.`);
    escribir(`--`);
    escribir(`-- Ejecucion:`);
    escribir(`--   sqlcmd -S localhost -U sa -P '<clave>' -d GymDatabase -C -f 65001 -i demo_dataset.sql`);
    escribir(`--`);
    escribir(`-- Es re-ejecutable: empieza borrando los datos demo anteriores. Todas las`);
    escribir(`-- cuentas usan el dominio @${DOMINIO_DEMO} y la contrasena ${PASSWORD_DEMO},`);
    escribir(`-- y ese dominio es lo unico que las distingue de los usuarios reales.`);
    escribir(`-- ============================================================================`);
    escribir();
    escribir('SET NOCOUNT ON;');
    escribir('GO');
    escribir();

    escribir('-- --------------------------------------------------------------------------');
    escribir('-- Comprobaciones previas. Si algo falta se activa NOEXEC y el resto del');
    escribir('-- script no se ejecuta, en lugar de dejar los datos a medias.');
    escribir('-- --------------------------------------------------------------------------');
    escribir(`IF OBJECT_ID('dbo.Users','U') IS NULL OR OBJECT_ID('dbo.Plans','U') IS NULL OR OBJECT_ID('dbo.Roles','U') IS NULL`);
    escribir('BEGIN');
    escribir("    PRINT 'ERROR: faltan las tablas base (Users, Plans, Roles). Revisa la base seleccionada con -d.';");
    escribir('    SET NOEXEC ON;');
    escribir('END');
    escribir('GO');
    escribir();
    escribir("IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Member')");
    escribir("   OR NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Coach')");
    escribir('BEGIN');
    escribir("    PRINT 'ERROR: faltan los roles Member y Coach. Ejecuta primero el seed de datos maestros.';");
    escribir('    SET NOEXEC ON;');
    escribir('END');
    escribir('GO');
    escribir();

    const nombresPlanes = PLANES.map((p) => `N'${p.PlanName}'`).join(', ');
    escribir(`IF (SELECT COUNT(*) FROM dbo.Plans WHERE PlanName IN (${nombresPlanes})) < 3`);
    escribir('BEGIN');
    escribir("    PRINT 'ERROR: faltan los 3 planes base. Ejecuta primero el seed de datos maestros.';");
    escribir('    SET NOEXEC ON;');
    escribir('END');
    escribir('GO');
    escribir();

    escribir("PRINT 'Cargando datos de demostracion...';");
    escribir('GO');
    escribir();

    // --- Limpieza previa ----------------------------------------------------
    escribir('-- --------------------------------------------------------------------------');
    escribir('-- Borrado de una carga anterior, para que el script sea re-ejecutable.');
    escribir('-- --------------------------------------------------------------------------');
    for (const linea of sentenciasDeBorrado()) escribir(linea);
    escribir();

    // --- Usuarios -----------------------------------------------------------
    emitir({
        titulo: 'Usuarios (entrenadores y socios)',
        cabecera: [
            'INSERT INTO dbo.Users (IDNumber, FirstName, LastName, Email, PasswordHash, PhoneNumber, RoleID, Status, CreatedAt)',
            'SELECT v.IDNumber, v.FirstName, v.LastName, v.Email, v.PasswordHash, v.PhoneNumber, r.RoleID, v.Status,',
            '       CONVERT(datetime, v.CreatedAt, 120)',
            'FROM (VALUES'
        ].join('\n'),
        filas: almacen.Users.map((u) => `    (${[
            lit(u.IDNumber), lit(u.FirstName), lit(u.LastName), lit(u.Email), lit(u.PasswordHash),
            lit(u.PhoneNumber), lit(rolPorId[u.RoleID]), lit(u.Status), lit(u.CreatedAt)
        ].join(', ')})`),
        pie: [
            ') AS v(IDNumber, FirstName, LastName, Email, PasswordHash, PhoneNumber, RoleName, Status, CreatedAt)',
            'JOIN dbo.Roles r ON r.RoleName = v.RoleName;'
        ].join('\n')
    });

    // --- Permisos y asignaciones de entrenadores ----------------------------
    emitir({
        titulo: 'Permisos de los entrenadores',
        requiere: ['CoachPermissions'],
        cabecera: [
            'INSERT INTO dbo.CoachPermissions (CoachID, CanEditOthersRoutines, CanManagePlans, CanSendMessages)',
            'SELECT u.UserID, v.CanEditOthersRoutines, v.CanManagePlans, v.CanSendMessages',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.CoachPermissions || []).map((p) => `    (${[
            lit(emailPorUsuario.get(p.CoachID)), p.CanEditOthersRoutines, p.CanManagePlans, p.CanSendMessages
        ].join(', ')})`),
        pie: [
            ') AS v(Email, CanEditOthersRoutines, CanManagePlans, CanSendMessages)',
            'JOIN dbo.Users u ON u.Email = v.Email;'
        ].join('\n')
    });

    emitir({
        titulo: 'Socios asignados a cada entrenador',
        requiere: ['CoachAssignments'],
        cabecera: [
            'INSERT INTO dbo.CoachAssignments (CoachID, MemberID, AssignedAt)',
            'SELECT c.UserID, m.UserID, CONVERT(datetime, v.AssignedAt, 120)',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.CoachAssignments || []).map((a) => `    (${[
            lit(emailPorUsuario.get(a.CoachID)), lit(emailPorUsuario.get(a.MemberID)), lit(a.AssignedAt)
        ].join(', ')})`),
        pie: [
            ') AS v(CoachEmail, MemberEmail, AssignedAt)',
            'JOIN dbo.Users c ON c.Email = v.CoachEmail',
            'JOIN dbo.Users m ON m.Email = v.MemberEmail;'
        ].join('\n')
    });

    emitir({
        titulo: 'Horario laboral de los entrenadores',
        requiere: ['CoachWorkHours'],
        cabecera: [
            'INSERT INTO dbo.CoachWorkHours (CoachID, DayOfWeek, StartTime, EndTime)',
            'SELECT u.UserID, v.DayOfWeek, v.StartTime, v.EndTime',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.CoachWorkHours || []).map((h) => `    (${[
            lit(emailPorUsuario.get(h.CoachID)), lit(h.DayOfWeek), lit(h.StartTime), lit(h.EndTime)
        ].join(', ')})`),
        pie: [
            ') AS v(Email, DayOfWeek, StartTime, EndTime)',
            'JOIN dbo.Users u ON u.Email = v.Email;'
        ].join('\n')
    });

    // --- Suscripciones y pagos ---------------------------------------------
    emitir({
        titulo: 'Suscripciones (incluye el historial de renovaciones)',
        cabecera: [
            'INSERT INTO dbo.Subscriptions (UserID, PlanID, StartDate, EndDate, PaymentStatus)',
            'SELECT u.UserID, p.PlanID, CONVERT(date, v.StartDate, 120), CONVERT(date, v.EndDate, 120), v.PaymentStatus',
            'FROM (VALUES'
        ].join('\n'),
        filas: almacen.Subscriptions.map((s) => `    (${[
            lit(emailPorUsuario.get(s.UserID)), lit(planPorId[s.PlanID]), lit(s.StartDate), lit(s.EndDate),
            lit(s.PaymentStatus)
        ].join(', ')})`),
        pie: [
            ') AS v(Email, PlanName, StartDate, EndDate, PaymentStatus)',
            'JOIN dbo.Users u ON u.Email = v.Email',
            'JOIN dbo.Plans p ON p.PlanName = v.PlanName;'
        ].join('\n')
    });

    // La suscripcion se localiza por socio + fecha de inicio.
    emitir({
        titulo: 'Pagos',
        cabecera: [
            'INSERT INTO dbo.Payments (SubscriptionID, AmountPaid, PaymentDate, PaymentMethod, ReferenceNumber, Status)',
            'SELECT s.SubscriptionID, v.AmountPaid, CONVERT(datetime, v.PaymentDate, 120), v.PaymentMethod,',
            '       v.ReferenceNumber, v.Status',
            'FROM (VALUES'
        ].join('\n'),
        filas: almacen.Payments.map((p) => {
            const sub = suscripcionPorId.get(p.SubscriptionID);
            return `    (${[
                lit(sub.email), lit(sub.inicio), p.AmountPaid, lit(p.PaymentDate), lit(p.PaymentMethod),
                lit(p.ReferenceNumber, 'VARCHAR(100)'), lit(p.Status)
            ].join(', ')})`;
        }),
        pie: [
            ') AS v(Email, SubStart, AmountPaid, PaymentDate, PaymentMethod, ReferenceNumber, Status)',
            'JOIN dbo.Users u ON u.Email = v.Email',
            'JOIN dbo.Subscriptions s ON s.UserID = u.UserID AND s.StartDate = CONVERT(date, v.SubStart, 120);'
        ].join('\n')
    });

    // --- Asistencias --------------------------------------------------------
    emitir({
        titulo: 'Asistencias (ingresos al gimnasio)',
        cabecera: [
            'INSERT INTO dbo.Attendance (UserID, CheckInTime)',
            'SELECT u.UserID, CONVERT(datetime, v.CheckInTime, 120)',
            'FROM (VALUES'
        ].join('\n'),
        filas: almacen.Attendance.map((a) => `    (${[
            lit(emailPorUsuario.get(a.UserID)), lit(a.CheckInTime)
        ].join(', ')})`),
        pie: [
            ') AS v(Email, CheckInTime)',
            'JOIN dbo.Users u ON u.Email = v.Email;'
        ].join('\n')
    });

    // --- Catalogo de ejercicios --------------------------------------------
    // Es un dato maestro compartido: solo se agrega lo que no exista.
    emitir({
        titulo: 'Catálogo de ejercicios',
        requiere: ['ExerciseCatalog'],
        cabecera: [
            'INSERT INTO dbo.ExerciseCatalog (Name, MuscleGroup, Description)',
            'SELECT v.Name, v.MuscleGroup, v.Description',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.ExerciseCatalog || []).map((e) => `    (${[
            lit(e.Name), lit(e.MuscleGroup), lit(e.Description)
        ].join(', ')})`),
        pie: [
            ') AS v(Name, MuscleGroup, Description)',
            'WHERE NOT EXISTS (SELECT 1 FROM dbo.ExerciseCatalog c WHERE c.Name = v.Name);'
        ].join('\n')
    });

    // --- Plantillas de rutina ----------------------------------------------
    emitir({
        titulo: 'Plantillas de rutina',
        requiere: ['RoutineTemplates'],
        cabecera: [
            'INSERT INTO dbo.RoutineTemplates (CoachID, TemplateName, Goal)',
            'SELECT u.UserID, v.TemplateName, v.Goal',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.RoutineTemplates || []).map((t) => `    (${[
            lit(emailPorUsuario.get(t.CoachID)), lit(t.TemplateName), lit(t.Goal)
        ].join(', ')})`),
        pie: [
            ') AS v(Email, TemplateName, Goal)',
            'JOIN dbo.Users u ON u.Email = v.Email;'
        ].join('\n')
    });

    emitir({
        titulo: 'Ejercicios de cada plantilla',
        requiere: ['RoutineTemplates', 'RoutineTemplateExercises'],
        cabecera: [
            'INSERT INTO dbo.RoutineTemplateExercises (TemplateID, ExerciseName, Sets, Reps, Weight, DayOfWeek)',
            'SELECT t.TemplateID, v.ExerciseName, v.Sets, v.Reps, v.Weight, v.DayOfWeek',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.RoutineTemplateExercises || []).map((e) => {
            const plantilla = plantillaPorId.get(e.TemplateID);
            return `    (${[
                lit(plantilla.email), lit(plantilla.nombre), lit(e.ExerciseName), e.Sets, e.Reps,
                lit(e.Weight, 'DECIMAL(5,2)'), lit(e.DayOfWeek)
            ].join(', ')})`;
        }),
        pie: [
            ') AS v(CoachEmail, TemplateName, ExerciseName, Sets, Reps, Weight, DayOfWeek)',
            'JOIN dbo.Users u ON u.Email = v.CoachEmail',
            'JOIN dbo.RoutineTemplates t ON t.CoachID = u.UserID AND t.TemplateName = v.TemplateName;'
        ].join('\n')
    });

    // --- Rutinas asignadas --------------------------------------------------
    emitir({
        titulo: 'Rutinas asignadas a los socios',
        cabecera: [
            'INSERT INTO dbo.Routines (UserID, CoachID, RoutineName, Goal, Status, AssignedAt)',
            'SELECT m.UserID, c.UserID, v.RoutineName, v.Goal, v.Status, CONVERT(datetime, v.AssignedAt, 120)',
            'FROM (VALUES'
        ].join('\n'),
        filas: almacen.Routines.map((r) => `    (${[
            lit(emailPorUsuario.get(r.UserID)), lit(emailPorUsuario.get(r.CoachID)), lit(r.RoutineName),
            lit(r.Goal), lit(r.Status), lit(r.AssignedAt)
        ].join(', ')})`),
        pie: [
            ') AS v(MemberEmail, CoachEmail, RoutineName, Goal, Status, AssignedAt)',
            'JOIN dbo.Users m ON m.Email = v.MemberEmail',
            'JOIN dbo.Users c ON c.Email = v.CoachEmail;'
        ].join('\n')
    });

    emitir({
        titulo: 'Ejercicios de cada rutina',
        requiere: ['RoutineExercises'],
        cabecera: [
            'INSERT INTO dbo.RoutineExercises (RoutineID, ExerciseName, Sets, Reps, Weight, DayOfWeek)',
            'SELECT r.RoutineID, v.ExerciseName, v.Sets, v.Reps, v.Weight, v.DayOfWeek',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.RoutineExercises || []).map((e) => `    (${[
            lit(rutinaPorId.get(e.RoutineID)), lit(e.ExerciseName), e.Sets, e.Reps,
            lit(e.Weight, 'DECIMAL(5,2)'), lit(e.DayOfWeek)
        ].join(', ')})`),
        pie: [
            ') AS v(MemberEmail, ExerciseName, Sets, Reps, Weight, DayOfWeek)',
            'JOIN dbo.Users u ON u.Email = v.MemberEmail',
            'JOIN dbo.Routines r ON r.UserID = u.UserID;'
        ].join('\n')
    });

    // --- Entrenamientos completados ----------------------------------------
    emitir({
        titulo: 'Entrenamientos completados',
        requiere: ['WorkoutSessions'],
        cabecera: [
            'INSERT INTO dbo.WorkoutSessions (UserID, RoutineID, CompletedAt, TotalExercisesCompleted)',
            'SELECT u.UserID, r.RoutineID, CONVERT(datetime, v.CompletedAt, 120), v.TotalExercisesCompleted',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.WorkoutSessions || []).map((s) => `    (${[
            lit(emailPorUsuario.get(s.UserID)), lit(s.CompletedAt), s.TotalExercises
        ].join(', ')})`),
        pie: [
            ') AS v(Email, CompletedAt, TotalExercisesCompleted)',
            'JOIN dbo.Users u ON u.Email = v.Email',
            'LEFT JOIN dbo.Routines r ON r.UserID = u.UserID;'
        ].join('\n')
    });

    emitir({
        titulo: 'Detalle de cada entrenamiento',
        requiere: ['WorkoutSessions', 'WorkoutSessionDetails'],
        cabecera: [
            'INSERT INTO dbo.WorkoutSessionDetails (SessionID, ExerciseName, SetsCompleted, RepsCompleted, WeightUsed)',
            'SELECT s.SessionID, v.ExerciseName, v.SetsCompleted, v.RepsCompleted, v.WeightUsed',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.WorkoutSessionDetails || []).map((d) => {
            const sesion = sesionPorId.get(d.SessionID);
            return `    (${[
                lit(sesion.email), lit(sesion.momento), lit(d.ExerciseName), d.SetsCompleted, d.RepsCompleted,
                lit(d.WeightUsed, 'DECIMAL(10,2)')
            ].join(', ')})`;
        }),
        pie: [
            ') AS v(Email, CompletedAt, ExerciseName, SetsCompleted, RepsCompleted, WeightUsed)',
            'JOIN dbo.Users u ON u.Email = v.Email',
            'JOIN dbo.WorkoutSessions s ON s.UserID = u.UserID AND s.CompletedAt = CONVERT(datetime, v.CompletedAt, 120);'
        ].join('\n')
    });

    // --- Evaluaciones fisicas ----------------------------------------------
    emitir({
        titulo: 'Evaluaciones físicas',
        requiere: ['PhysicalEvaluations'],
        cabecera: [
            'INSERT INTO dbo.PhysicalEvaluations (UserID, CoachID, WeightKg, BodyFatPercentage, MuscleMassPercentage, EvaluationDate)',
            'SELECT m.UserID, c.UserID, v.WeightKg, v.BodyFatPercentage, v.MuscleMassPercentage,',
            '       CONVERT(datetime, v.EvaluationDate, 120)',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.PhysicalEvaluations || []).map((e) => `    (${[
            lit(emailPorUsuario.get(e.UserID)), lit(emailPorUsuario.get(e.CoachID)), e.WeightKg,
            e.BodyFatPercentage, e.MuscleMassPercentage, lit(e.EvaluationDate)
        ].join(', ')})`),
        pie: [
            ') AS v(MemberEmail, CoachEmail, WeightKg, BodyFatPercentage, MuscleMassPercentage, EvaluationDate)',
            'JOIN dbo.Users m ON m.Email = v.MemberEmail',
            'JOIN dbo.Users c ON c.Email = v.CoachEmail;'
        ].join('\n')
    });

    // --- Clases grupales ----------------------------------------------------
    emitir({
        titulo: 'Clases grupales programadas',
        requiere: ['Classes'],
        cabecera: [
            'INSERT INTO dbo.Classes (ClassName, CoachID, StartTime, EndTime, MaxCapacity, Description)',
            'SELECT v.ClassName, u.UserID, CONVERT(datetime, v.StartTime, 120), CONVERT(datetime, v.EndTime, 120),',
            '       v.MaxCapacity, v.Description',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.Classes || []).map((c) => `    (${[
            lit(c.ClassName), lit(emailPorUsuario.get(c.CoachID)), lit(c.StartTime), lit(c.EndTime),
            c.MaxCapacity, lit(c.Description)
        ].join(', ')})`),
        pie: [
            ') AS v(ClassName, Email, StartTime, EndTime, MaxCapacity, Description)',
            'JOIN dbo.Users u ON u.Email = v.Email;'
        ].join('\n')
    });

    emitir({
        titulo: 'Reservas de clases',
        requiere: ['Classes', 'ClassReservations'],
        cabecera: [
            'INSERT INTO dbo.ClassReservations (ClassID, UserID)',
            'SELECT c.ClassID, u.UserID',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.ClassReservations || []).map((r) => {
            const clase = clasePorId.get(r.ClassID);
            return `    (${[lit(clase.nombre), lit(clase.inicio), lit(emailPorUsuario.get(r.UserID))].join(', ')})`;
        }),
        // El filtro por entrenador demo evita que una clase real que coincidiera
        // en nombre y horario se llevara estas reservas.
        pie: [
            ') AS v(ClassName, StartTime, Email)',
            'JOIN dbo.Users u ON u.Email = v.Email',
            'JOIN dbo.Classes c ON c.ClassName = v.ClassName AND c.StartTime = CONVERT(datetime, v.StartTime, 120)',
            `WHERE c.CoachID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@${DOMINIO_DEMO}');`
        ].join('\n')
    });

    // --- Notificaciones y correos ------------------------------------------
    emitir({
        titulo: 'Notificaciones',
        cabecera: [
            'INSERT INTO dbo.Notifications (UserID, Title, Message, Type, IsRead, CreatedAt)',
            'SELECT u.UserID, v.Title, v.Message, v.Type, v.IsRead, CONVERT(datetime, v.CreatedAt, 120)',
            'FROM (VALUES'
        ].join('\n'),
        filas: almacen.Notifications.map((n) => `    (${[
            lit(emailPorUsuario.get(n.UserID)), lit(n.Title), lit(n.Message), lit(n.Type), n.IsRead, lit(n.CreatedAt)
        ].join(', ')})`),
        pie: [
            ') AS v(Email, Title, Message, Type, IsRead, CreatedAt)',
            'JOIN dbo.Users u ON u.Email = v.Email;'
        ].join('\n')
    });

    emitir({
        titulo: 'Bitácora de correos enviados',
        requiere: ['EmailLogs'],
        cabecera: [
            'INSERT INTO dbo.EmailLogs (UserID, EmailType, Status)',
            'SELECT u.UserID, v.EmailType, v.Status',
            'FROM (VALUES'
        ].join('\n'),
        filas: (almacen.EmailLogs || []).map((e) => `    (${[
            lit(emailPorUsuario.get(e.UserID)), lit(e.EmailType), lit(e.Status)
        ].join(', ')})`),
        pie: [
            ') AS v(Email, EmailType, Status)',
            'JOIN dbo.Users u ON u.Email = v.Email;'
        ].join('\n')
    });

    // --- Resumen ------------------------------------------------------------
    escribir('-- --------------------------------------------------------------------------');
    escribir('-- Resumen de lo cargado');
    escribir('-- --------------------------------------------------------------------------');
    escribir(resumenFinal());
    escribir('GO');
    escribir();
    escribir('SET NOEXEC OFF;');
    escribir('GO');
};

/** DELETE en orden inverso a las llaves foraneas, filtrando por el dominio demo. */
const sentenciasDeBorrado = () => {
    const demo = `SELECT UserID FROM dbo.Users WHERE Email LIKE '%@${DOMINIO_DEMO}'`;
    const lineas = [];

    const borrar = (tablasNecesarias, sentencia) => {
        const guarda = tablasNecesarias.map((t) => `OBJECT_ID('dbo.${t}','U') IS NOT NULL`).join(' AND ');
        lineas.push(`IF ${guarda}`);
        lineas.push('BEGIN');
        lineas.push(sentencia.split('\n').map((l) => '    ' + l).join('\n'));
        lineas.push('END');
        lineas.push('GO');
    };

    // La auditoria la escriben los triggers al insertar o modificar pagos; sus
    // filas apuntan a pagos que estan a punto de desaparecer.
    //
    // Va por EXEC y no como sentencia suelta a proposito: SQL Server resuelve
    // los nombres de columna al compilar el lote, aunque el IF sea falso. Si en
    // esta base AuditLogs tuviera otras columnas, un DELETE literal reventaria
    // el lote entero; dentro de EXEC solo se compila si de verdad se ejecuta.
    // Dentro de la cadena de sp_executesql toda comilla simple va duplicada,
    // incluidas las del patron LIKE de la subconsulta.
    const demoEscapado = demo.replace(/'/g, "''");

    lineas.push(`IF OBJECT_ID('dbo.AuditLogs','U') IS NOT NULL
   AND COL_LENGTH('dbo.AuditLogs','TableName') IS NOT NULL
   AND COL_LENGTH('dbo.AuditLogs','EntityID') IS NOT NULL
BEGIN
    EXEC sp_executesql N'
        DELETE FROM dbo.AuditLogs
        WHERE TableName = ''Payments''
          AND EntityID IN (SELECT p.PaymentID FROM dbo.Payments p
                           JOIN dbo.Subscriptions s ON s.SubscriptionID = p.SubscriptionID
                           WHERE s.UserID IN (${demoEscapado}));';
END`);
    lineas.push('GO');

    borrar(['WorkoutSessionDetails', 'WorkoutSessions', 'Users'], `DELETE FROM dbo.WorkoutSessionDetails
WHERE SessionID IN (SELECT SessionID FROM dbo.WorkoutSessions WHERE UserID IN (${demo}));`);

    borrar(['WorkoutSessions', 'Users'], `DELETE FROM dbo.WorkoutSessions WHERE UserID IN (${demo});`);

    borrar(['RoutineExercises', 'Routines', 'Users'], `DELETE FROM dbo.RoutineExercises
WHERE RoutineID IN (SELECT RoutineID FROM dbo.Routines WHERE UserID IN (${demo}) OR CoachID IN (${demo}));`);

    borrar(['Routines', 'Users'], `DELETE FROM dbo.Routines WHERE UserID IN (${demo}) OR CoachID IN (${demo});`);

    borrar(['RoutineTemplateExercises', 'RoutineTemplates', 'Users'], `DELETE FROM dbo.RoutineTemplateExercises
WHERE TemplateID IN (SELECT TemplateID FROM dbo.RoutineTemplates WHERE CoachID IN (${demo}));`);

    borrar(['RoutineTemplates', 'Users'], `DELETE FROM dbo.RoutineTemplates WHERE CoachID IN (${demo});`);

    borrar(['ClassReservations', 'Classes', 'Users'], `DELETE FROM dbo.ClassReservations
WHERE UserID IN (${demo})
   OR ClassID IN (SELECT ClassID FROM dbo.Classes WHERE CoachID IN (${demo}));`);

    borrar(['Classes', 'Users'], `DELETE FROM dbo.Classes WHERE CoachID IN (${demo});`);

    borrar(['CoachWorkHours', 'Users'], `DELETE FROM dbo.CoachWorkHours WHERE CoachID IN (${demo});`);

    borrar(['PhysicalEvaluations', 'Users'], `DELETE FROM dbo.PhysicalEvaluations
WHERE UserID IN (${demo}) OR CoachID IN (${demo});`);

    borrar(['Payments', 'Subscriptions', 'Users'], `DELETE FROM dbo.Payments
WHERE SubscriptionID IN (SELECT SubscriptionID FROM dbo.Subscriptions WHERE UserID IN (${demo}));`);

    borrar(['Subscriptions', 'Users'], `DELETE FROM dbo.Subscriptions WHERE UserID IN (${demo});`);

    borrar(['CoachAssignments', 'Users'], `DELETE FROM dbo.CoachAssignments
WHERE CoachID IN (${demo}) OR MemberID IN (${demo});`);

    borrar(['CoachPermissions', 'Users'], `DELETE FROM dbo.CoachPermissions WHERE CoachID IN (${demo});`);
    borrar(['EmailLogs', 'Users'], `DELETE FROM dbo.EmailLogs WHERE UserID IN (${demo});`);
    borrar(['Attendance', 'Users'], `DELETE FROM dbo.Attendance WHERE UserID IN (${demo});`);
    borrar(['Notifications', 'Users'], `DELETE FROM dbo.Notifications WHERE UserID IN (${demo});`);
    borrar(['PasswordResetTokens', 'Users'], `DELETE FROM dbo.PasswordResetTokens WHERE UserID IN (${demo});`);

    // El catalogo de ejercicios no se borra: es un dato maestro que tambien
    // alimentan los entrenadores y no hay forma de saber que fila creo la demo.
    lineas.push(`DELETE FROM dbo.Users WHERE Email LIKE '%@${DOMINIO_DEMO}';`);
    lineas.push('GO');

    return lineas;
};

const resumenFinal = () => `SELECT 'Usuarios' AS Tabla, COUNT(*) AS Filas FROM dbo.Users WHERE Email LIKE '%@${DOMINIO_DEMO}'
UNION ALL SELECT 'Suscripciones', COUNT(*) FROM dbo.Subscriptions
    WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@${DOMINIO_DEMO}')
UNION ALL SELECT 'Pagos', COUNT(*) FROM dbo.Payments
    WHERE SubscriptionID IN (SELECT SubscriptionID FROM dbo.Subscriptions
        WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@${DOMINIO_DEMO}'))
UNION ALL SELECT 'Asistencias', COUNT(*) FROM dbo.Attendance
    WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@${DOMINIO_DEMO}')
UNION ALL SELECT 'Rutinas', COUNT(*) FROM dbo.Routines
    WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@${DOMINIO_DEMO}')
UNION ALL SELECT 'Notificaciones', COUNT(*) FROM dbo.Notifications
    WHERE UserID IN (SELECT UserID FROM dbo.Users WHERE Email LIKE '%@${DOMINIO_DEMO}');`;

// ============================================================================
// 4. Programa principal
// ============================================================================

const guardarLimpieza = () => {
    const contenido = [
        '-- ============================================================================',
        '-- BORRADO DE LOS DATOS DE DEMOSTRACION - SLIMMING GYM FITNESS',
        '--',
        '-- Generado por backend-gimnasio/scripts/generar-dataset-sql.js',
        '--',
        `-- Borra unicamente los usuarios con correo @${DOMINIO_DEMO} y todo lo que`,
        '-- cuelga de ellos. Ningun socio real se ve afectado.',
        '--',
        "--   sqlcmd -S localhost -U sa -P '<clave>' -d GymDatabase -C -f 65001 -i demo_limpiar.sql",
        '-- ============================================================================',
        '',
        'SET NOCOUNT ON;',
        'GO',
        '',
        ...sentenciasDeBorrado(),
        '',
        "PRINT 'Datos de demostracion eliminados.';",
        'GO',
        ''
    ].join('\n');

    fs.writeFileSync(path.join(DESTINO, 'demo_limpiar.sql'), contenido, 'utf8');
};

ejecutar()
    .then(() => {
        generar();

        const archivo = path.join(DESTINO, 'demo_dataset.sql');
        fs.writeFileSync(archivo, bloque.join('\n') + '\n', 'utf8');
        guardarLimpieza();

        const filas = Object.values(almacen).reduce((total, lista) => total + lista.length, 0);
        const kb = Math.round(fs.statSync(archivo).size / 1024);

        console.log('\n📄 Dataset SQL generado:');
        console.log(`   database/seeds/demo_dataset.sql  (${filas} filas, ${kb} KB)`);
        console.log('   database/seeds/demo_limpiar.sql');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error generando el dataset:', error.message);
        console.error(error);
        process.exit(1);
    });
