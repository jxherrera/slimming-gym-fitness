/**
 * Poblado de datos de DEMOSTRACION para Slimming Gym Fitness.
 *
 * Genera un gimnasio completo y verosimil: entrenadores, socios con distintos
 * estados de membresia, pagos aprobados y pendientes, asistencias con horas
 * pico, rutinas, clases grupales, evaluaciones fisicas y notificaciones. Sirve
 * para revisar los paneles y para la defensa del proyecto sin depender de que
 * alguien registre datos a mano.
 *
 * NO reemplaza a seedRunner.js: aquel carga los datos maestros (roles, planes y
 * el administrador maestro) y este los da por hechos; si faltan, los crea.
 *
 * Uso:
 *   node seeders/demoDataSeeder.js              genera los datos
 *   node seeders/demoDataSeeder.js --limpiar    borra unicamente lo generado
 *   node seeders/demoDataSeeder.js --forzar     regenera (limpia y vuelve a crear)
 *
 * Todas las cuentas creadas usan el dominio de correo `demo.slimminggym.com`.
 * Ese dominio es el unico marcador que distingue estos registros de los reales,
 * de modo que `--limpiar` jamas toca informacion de produccion.
 */

const bcrypt = require('bcrypt');
const { sql, poolPromise } = require('../config/db');
const datos = require('./demoData');

const {
    DOMINIO_DEMO,
    PASSWORD_DEMO,
    COACHES,
    ADMINISTRADORES,
    SOCIOS,
    OBJETIVOS,
    NOMBRES_RUTINA,
    EJERCICIOS,
    PLANTILLAS,
    CLASES,
    HORARIOS_COACH,
    NOTIFICACIONES
} = datos;

// Subconsulta reutilizada por el borrado: identifica a los usuarios generados.
const USUARIOS_DEMO = `SELECT UserID FROM dbo.Users WHERE Email LIKE '%@${DOMINIO_DEMO}'`;

// ============================================================================
// Utilidades deterministas
// ============================================================================

/**
 * Generador pseudoaleatorio con semilla (mulberry32).
 *
 * Se usa en lugar de Math.random para que dos ejecuciones produzcan exactamente
 * los mismos datos: si una captura de pantalla se toma hoy y la base se
 * regenera manana, las cifras siguen coincidiendo.
 */
const crearAzar = (semilla) => () => {
    semilla |= 0;
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const azar = crearAzar(20260809);

const entero = (min, max) => min + Math.floor(azar() * (max - min + 1));
const elegir = (lista) => lista[entero(0, lista.length - 1)];
const decimal = (min, max, decimales = 1) => Number((min + azar() * (max - min)).toFixed(decimales));

/**
 * Cedula ecuatoriana con digito verificador valido (modulo 10).
 *
 * Importa que sean validas: el formulario de registro las valida y una cedula
 * inventada delataria de inmediato que los datos son de prueba.
 */
const generarCedula = (provincia, cuerpo) => {
    const base = String(provincia).padStart(2, '0') + String(cuerpo).padStart(7, '0');
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let producto = Number(base[i]) * coeficientes[i];
        if (producto > 9) producto -= 9;
        suma += producto;
    }

    const verificador = (10 - (suma % 10)) % 10;
    return base + verificador;
};

// Telefono celular ecuatoriano: 09 + 8 digitos.
const generarTelefono = () => '09' + String(entero(10000000, 99999999));

/**
 * Correo sin tildes ni espacios a partir del nombre real de la persona.
 */
const generarEmail = (nombres, apellidos, indice) => {
    const limpiar = (texto) => texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // marcas diacriticas: tildes y dieresis
        .toLowerCase()
        .replace(/[^a-z ]/g, '')
        .trim();

    const nombre = limpiar(nombres).split(' ')[0];
    const apellido = limpiar(apellidos).split(' ')[0];
    return `${nombre}.${apellido}${indice}@${DOMINIO_DEMO}`;
};

// --- Fechas -----------------------------------------------------------------
// Se envian a SQL Server como texto en estilo 120 ('YYYY-MM-DD HH:mm:ss') y se
// convierten con CONVERT. Enviar objetos Date obligaria a razonar sobre la zona
// horaria del driver, y una asistencia registrada a las 18:00 aparecería a las
// 23:00 en la bitacora del dia.
const hoy = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const sumarDias = (fecha, dias) => {
    const d = new Date(fecha);
    d.setDate(d.getDate() + dias);
    return d;
};

const conHora = (fecha, hora, minuto = 0) => {
    const d = new Date(fecha);
    d.setHours(hora, minuto, 0, 0);
    return d;
};

const pad = (n) => String(n).padStart(2, '0');

const fechaSQL = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fechaHoraSQL = (d) =>
    `${fechaSQL(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

// ============================================================================
// Ayudas de base de datos
// ============================================================================

/**
 * El esquema versionado en /database no incluye todas las tablas que la API ya
 * usa (clases, evaluaciones, plantillas...). En lugar de fallar contra una base
 * que aun no las tiene, se consulta el catalogo y se omite lo que no exista.
 */
const detectarTablas = async (pool, nombres) => {
    const resultado = await pool.request().query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    const existentes = new Set(resultado.recordset.map((f) => f.TABLE_NAME.toLowerCase()));
    return new Set(nombres.filter((n) => existentes.has(n.toLowerCase())));
};

const existeColumna = async (pool, tabla, columna) => {
    const resultado = await pool.request()
        .input('Tabla', sql.VarChar(128), tabla)
        .input('Columna', sql.VarChar(128), columna)
        .query(`
            SELECT 1 AS Existe FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @Tabla AND COLUMN_NAME = @Columna
        `);
    return resultado.recordset.length > 0;
};

const obtenerRoles = async (pool) => {
    const resultado = await pool.request().query('SELECT RoleID, RoleName FROM dbo.Roles');
    const mapa = {};
    for (const fila of resultado.recordset) mapa[fila.RoleName] = fila.RoleID;
    return mapa;
};

const obtenerPlanes = async (pool) => {
    const resultado = await pool.request()
        .query("SELECT PlanID, PlanName, Price, DurationDays FROM dbo.Plans WHERE Status = 'A' ORDER BY Price");
    return resultado.recordset;
};

const contarUsuariosDemo = async (pool) => {
    const resultado = await pool.request()
        .query(`SELECT COUNT(*) AS Total FROM dbo.Users WHERE Email LIKE '%@${DOMINIO_DEMO}'`);
    return resultado.recordset[0].Total;
};

// ============================================================================
// 1. Usuarios
// ============================================================================

const sembrarUsuarios = async (pool, roles, planes) => {
    console.log('\n👥 Creando usuarios...');

    const passwordHash = await bcrypt.hash(PASSWORD_DEMO, 10);
    const creados = { coaches: [], socios: [], admins: [] };

    // Provincia y secuencia arrancan fijas para que las cedulas sean estables
    // entre ejecuciones.
    let secuencia = 1450321;

    /**
     * IDNumber es UNIQUE: si un socio real ya tiene la cedula generada, se
     * avanza la secuencia hasta encontrar una libre en lugar de reventar a mitad
     * del poblado.
     */
    const cedulaLibre = async () => {
        for (let intento = 0; intento < 200; intento++) {
            const cedula = generarCedula(entero(1, 24), secuencia++);
            const ocupada = await pool.request()
                .input('IDNumber', sql.VarChar(15), cedula)
                .query('SELECT 1 AS Existe FROM dbo.Users WHERE IDNumber = @IDNumber');

            if (ocupada.recordset.length === 0) return cedula;
        }
        throw new Error('No se pudo generar una cédula libre tras 200 intentos.');
    };

    const insertarUsuario = async ({ nombres, apellidos, email, roleId, estado, creadoHace }) => {
        const cedula = await cedulaLibre();
        const resultado = await pool.request()
            .input('IDNumber', sql.VarChar(15), cedula)
            .input('FirstName', sql.VarChar(100), nombres)
            .input('LastName', sql.VarChar(100), apellidos)
            .input('Email', sql.VarChar(150), email)
            .input('PasswordHash', sql.VarChar(255), passwordHash)
            .input('PhoneNumber', sql.VarChar(20), generarTelefono())
            .input('RoleID', sql.Int, roleId)
            .input('Status', sql.Char(1), estado)
            .input('CreatedAt', sql.VarChar(23), fechaHoraSQL(creadoHace))
            .query(`
                INSERT INTO dbo.Users
                    (IDNumber, FirstName, LastName, Email, PasswordHash, PhoneNumber, RoleID, Status, CreatedAt)
                OUTPUT INSERTED.UserID
                VALUES
                    (@IDNumber, @FirstName, @LastName, @Email, @PasswordHash, @PhoneNumber, @RoleID, @Status,
                     CONVERT(datetime, @CreatedAt, 120))
            `);

        return { userId: resultado.recordset[0].UserID, cedula, email, nombres, apellidos };
    };

    // Entrenadores: son los primeros en registrarse, hasta dos anios atras.
    for (let i = 0; i < COACHES.length; i++) {
        const coach = COACHES[i];
        const usuario = await insertarUsuario({
            nombres: coach.nombres,
            apellidos: coach.apellidos,
            email: generarEmail(coach.nombres, coach.apellidos, i + 1),
            roleId: roles.Coach,
            estado: 'A',
            creadoHace: conHora(sumarDias(hoy(), -entero(400, 700)), entero(8, 18))
        });
        creados.coaches.push({ ...usuario, ...coach });
        console.log(`  [+] Coach ${coach.nombres} ${coach.apellidos} (${usuario.email})`);
    }

    for (let i = 0; i < ADMINISTRADORES.length; i++) {
        const admin = ADMINISTRADORES[i];
        const usuario = await insertarUsuario({
            nombres: admin.nombres,
            apellidos: admin.apellidos,
            email: generarEmail(admin.nombres, admin.apellidos, i + 1),
            roleId: roles.Admin,
            estado: 'A',
            creadoHace: conHora(sumarDias(hoy(), -entero(300, 500)), entero(8, 18))
        });
        creados.admins.push(usuario);
        console.log(`  [+] Admin ${admin.nombres} ${admin.apellidos} (${usuario.email})`);
    }

    // Socios: la antiguedad depende del perfil. Uno con tres renovaciones no
    // pudo haberse inscrito la semana pasada.
    for (let i = 0; i < SOCIOS.length; i++) {
        const socio = SOCIOS[i];
        const renovaciones = socio.renovaciones || 0;

        // El plan se decide aqui, y no al crear la suscripcion, porque de su
        // duracion depende cuanto tiempo lleva inscrito el socio. Si se sorteara
        // despues, un socio con tres renovaciones anuales tendria pagos de hace
        // cuatro anios y una ficha creada el mes pasado.
        const sorteo = azar();
        socio.plan = renovaciones >= 2
            // Con varias renovaciones solo caben planes cortos.
            ? (sorteo > 0.7 ? planes[1] || planes[0] : planes[0])
            : sorteo > 0.85
                ? planes[planes.length - 1]
                : sorteo > 0.55 ? planes[1] || planes[0] : planes[0];

        // Los inactivos se dieron de baja hace varios meses; se fija aqui para
        // que la fecha de registro alcance a cubrir toda su historia.
        if (socio.perfil === 'inactivo') socio.diasVencida = entero(120, 200);

        const antiguedad = ['pendiente', 'rechazado'].includes(socio.perfil)
            ? entero(1, 6)
            : socio.plan.DurationDays * (renovaciones + 1) + (socio.diasVencida || 0) + entero(5, 25);

        const usuario = await insertarUsuario({
            nombres: socio.nombres,
            apellidos: socio.apellidos,
            email: generarEmail(socio.nombres, socio.apellidos, i + 1),
            roleId: roles.Member,
            estado: socio.perfil === 'inactivo' ? 'I' : 'A',
            creadoHace: conHora(sumarDias(hoy(), -antiguedad), entero(9, 20), entero(0, 59))
        });

        creados.socios.push({ ...usuario, ...socio });
    }

    console.log(`  [+] ${creados.socios.length} socios creados.`);
    return creados;
};

// ============================================================================
// 2. Asignaciones y permisos de entrenadores
// ============================================================================

const sembrarCoaches = async (pool, { coaches, socios }, tablas) => {
    console.log('\n🧑‍🏫 Asignando socios y permisos a los entrenadores...');

    for (const coach of coaches) {
        await pool.request()
            .input('CoachID', sql.Int, coach.userId)
            .input('CanEditOthersRoutines', sql.Bit, coach.permisos.editarRutinasAjenas)
            .input('CanManagePlans', sql.Bit, coach.permisos.gestionarPlanes)
            .input('CanSendMessages', sql.Bit, coach.permisos.enviarMensajes)
            .query(`
                INSERT INTO dbo.CoachPermissions (CoachID, CanEditOthersRoutines, CanManagePlans, CanSendMessages)
                VALUES (@CoachID, @CanEditOthersRoutines, @CanManagePlans, @CanSendMessages)
            `);
    }

    // MemberID es UNIQUE en CoachAssignments: cada socio tiene un unico
    // entrenador. Se reparten en orden para que las carteras queden parejas.
    const activos = socios.filter((s) => s.perfil !== 'inactivo');
    for (let i = 0; i < activos.length; i++) {
        const coach = coaches[i % coaches.length];
        activos[i].coachId = coach.userId;

        await pool.request()
            .input('CoachID', sql.Int, coach.userId)
            .input('MemberID', sql.Int, activos[i].userId)
            .input('AssignedAt', sql.VarChar(23), fechaHoraSQL(conHora(sumarDias(hoy(), -entero(10, 120)), entero(9, 18))))
            .query(`
                INSERT INTO dbo.CoachAssignments (CoachID, MemberID, AssignedAt)
                VALUES (@CoachID, @MemberID, CONVERT(datetime, @AssignedAt, 120))
            `);
    }

    console.log(`  [+] ${activos.length} socios asignados entre ${coaches.length} entrenadores.`);

    if (tablas.has('CoachWorkHours')) {
        let horarios = 0;
        for (const horario of HORARIOS_COACH) {
            const coach = coaches[horario.coach];
            for (const dia of horario.dias) {
                await pool.request()
                    .input('CoachID', sql.Int, coach.userId)
                    .input('DayOfWeek', sql.VarChar(20), dia)
                    .input('StartTime', sql.VarChar(5), horario.inicio)
                    .input('EndTime', sql.VarChar(5), horario.fin)
                    .query(`
                        INSERT INTO dbo.CoachWorkHours (CoachID, DayOfWeek, StartTime, EndTime)
                        VALUES (@CoachID, @DayOfWeek, @StartTime, @EndTime)
                    `);
                horarios++;
            }
        }
        console.log(`  [+] ${horarios} bloques de horario laboral.`);
    }
};

// ============================================================================
// 3. Suscripciones y pagos
// ============================================================================

/**
 * Semantica de estados (ver database/DICCIONARIO_DATOS.md):
 *   Subscriptions.PaymentStatus  'P' pagada/vigente   'U' sin pagar
 *   Payments.Status              'A' aprobado  'P' pendiente  'R' rechazado
 *
 * Se replica lo que hace paymentController al aprobar: el pago pasa a 'A' y la
 * suscripcion a 'P' con las fechas recalculadas segun la duracion del plan.
 */
const sembrarSuscripciones = async (pool, { socios, admins }, tablas) => {
    console.log('\n💳 Generando suscripciones y pagos...');

    const tieneAuditor = await existeColumna(pool, 'Payments', 'LastModifiedBy');
    const auditor = admins.length > 0 ? admins[0].userId : null;
    let totalSuscripciones = 0;
    let totalPagos = 0;

    const crearSuscripcion = async (userId, plan, inicio, fin, estado) => {
        const resultado = await pool.request()
            .input('UserID', sql.Int, userId)
            .input('PlanID', sql.Int, plan.PlanID)
            .input('StartDate', sql.VarChar(10), fechaSQL(inicio))
            .input('EndDate', sql.VarChar(10), fechaSQL(fin))
            .input('PaymentStatus', sql.Char(1), estado)
            .query(`
                INSERT INTO dbo.Subscriptions (UserID, PlanID, StartDate, EndDate, PaymentStatus)
                OUTPUT INSERTED.SubscriptionID
                VALUES (@UserID, @PlanID, CONVERT(date, @StartDate, 120), CONVERT(date, @EndDate, 120), @PaymentStatus)
            `);
        totalSuscripciones++;
        return resultado.recordset[0].SubscriptionID;
    };

    const crearPago = async (subscriptionId, monto, fecha, estado) => {
        // El 60% paga en efectivo en recepcion; el resto por transferencia, y
        // solo esas ultimas llevan numero de comprobante.
        const esTransferencia = azar() > 0.6;
        const metodo = esTransferencia ? 'Transferencia' : 'Efectivo';
        const referencia = esTransferencia
            ? `TRF-${fecha.getFullYear()}-${String(entero(100000, 999999))}`
            : null;

        const peticion = pool.request()
            .input('SubscriptionID', sql.Int, subscriptionId)
            .input('AmountPaid', sql.Decimal(10, 2), monto)
            .input('PaymentDate', sql.VarChar(23), fechaHoraSQL(fecha))
            .input('PaymentMethod', sql.VarChar(50), metodo)
            .input('ReferenceNumber', sql.VarChar(100), referencia)
            .input('Status', sql.Char(1), estado);

        // Los pagos aprobados guardan quien los reviso; los pendientes aun no
        // tienen auditor.
        if (tieneAuditor) {
            peticion.input('LastModifiedBy', sql.Int, estado === 'A' ? auditor : null);
            await peticion.query(`
                INSERT INTO dbo.Payments
                    (SubscriptionID, AmountPaid, PaymentDate, PaymentMethod, ReferenceNumber, Status, LastModifiedBy)
                VALUES
                    (@SubscriptionID, @AmountPaid, CONVERT(datetime, @PaymentDate, 120), @PaymentMethod,
                     @ReferenceNumber, @Status, @LastModifiedBy)
            `);
        } else {
            await peticion.query(`
                INSERT INTO dbo.Payments
                    (SubscriptionID, AmountPaid, PaymentDate, PaymentMethod, ReferenceNumber, Status)
                VALUES
                    (@SubscriptionID, @AmountPaid, CONVERT(datetime, @PaymentDate, 120), @PaymentMethod,
                     @ReferenceNumber, @Status)
            `);
        }

        totalPagos++;
    };

    for (const socio of socios) {
        // El plan ya quedo decidido al crear al usuario: de su duracion depende
        // la fecha de registro.
        const plan = socio.plan;
        const duracion = plan.DurationDays;
        const precio = Number(plan.Price);

        // 1. Membresia vigente hoy. Cada perfil define su fecha de fin y de ahi
        //    se deduce el inicio restando la duracion del plan.
        let actual;

        switch (socio.perfil) {
            case 'vigente': {
                // Le quedan entre 5 y 25 dias.
                const fin = sumarDias(hoy(), entero(5, Math.min(duracion - 2, 25)));
                actual = { fin, estadoSub: 'P', estadoPago: 'A' };
                break;
            }
            case 'porVencer':
                actual = { fin: sumarDias(hoy(), socio.diasRestantes), estadoSub: 'P', estadoPago: 'A' };
                break;
            case 'vencida':
                actual = { fin: sumarDias(hoy(), -socio.diasVencida), estadoSub: 'P', estadoPago: 'A' };
                break;
            case 'inactivo':
                // Se dio de baja: su ultima membresia caduco hace meses.
                actual = { fin: sumarDias(hoy(), -socio.diasVencida), estadoSub: 'P', estadoPago: 'A' };
                break;
            case 'pendiente':
                // Aun sin aprobar: la suscripcion queda en 'U' y el pago en 'P',
                // que es como aparece en la bandeja del administrador. Las fechas
                // se recalculan solas cuando el pago se aprueba.
                actual = {
                    fin: sumarDias(hoy(), duracion),
                    estadoSub: 'U',
                    estadoPago: 'P',
                    fechaPago: conHora(sumarDias(hoy(), -entero(0, 2)), entero(9, 21), entero(0, 59))
                };
                break;
            case 'rechazado':
                actual = {
                    fin: sumarDias(hoy(), duracion),
                    estadoSub: 'U',
                    estadoPago: 'R',
                    fechaPago: conHora(sumarDias(hoy(), -entero(3, 8)), entero(9, 21), entero(0, 59))
                };
                break;
            default:
                actual = null;
        }

        if (!actual) continue;

        actual.inicio = ['pendiente', 'rechazado'].includes(socio.perfil)
            ? hoy()
            : sumarDias(actual.fin, -duracion);

        // 2. Historial: cada renovacion arranca el dia siguiente al fin de la
        //    anterior, encadenadas hacia atras desde la membresia vigente. Sin
        //    este encadenado las suscripciones se traslaparian y el historial de
        //    pagos del socio no cuadraria.
        const historial = [];
        let anclaje = actual.inicio;

        for (let r = 0; r < (socio.renovaciones || 0); r++) {
            const fin = sumarDias(anclaje, -1);
            const inicio = sumarDias(fin, -duracion);
            historial.unshift({ inicio, fin, estadoSub: 'P', estadoPago: 'A' });
            anclaje = inicio;
        }

        // Ventana real de membresia del socio. La usan las asistencias para no
        // registrar ingresos antes de su primera inscripcion ni despues de que
        // caduco la ultima.
        socio.primerInicio = (historial[0] || actual).inicio;
        socio.ultimoFin = actual.fin;

        // 3. Insercion en orden cronologico: los IDs quedan crecientes en el
        //    tiempo, igual que si los hubieran registrado dia a dia.
        for (const membresia of [...historial, actual]) {
            const subId = await crearSuscripcion(
                socio.userId, plan, membresia.inicio, membresia.fin, membresia.estadoSub
            );
            const fechaPago = membresia.fechaPago
                || conHora(membresia.inicio, entero(8, 20), entero(0, 59));
            await crearPago(subId, precio, fechaPago, membresia.estadoPago);
        }
    }

    console.log(`  [+] ${totalSuscripciones} suscripciones y ${totalPagos} pagos registrados.`);
    return { totalSuscripciones, totalPagos };
};

// ============================================================================
// 4. Asistencias
// ============================================================================

const sembrarAsistencias = async (pool, socios) => {
    console.log('\n🚪 Registrando asistencias de las últimas 10 semanas...');

    // Solo asisten quienes tuvieron membresia activa: los pendientes todavia no
    // entran y los inactivos ya no vienen.
    const asistentes = socios.filter((s) => ['vigente', 'porVencer', 'vencida'].includes(s.perfil));
    let total = 0;

    for (const socio of asistentes) {
        // Constancia del socio: entre 2 y 5 visitas por semana.
        const visitasSemana = entero(2, 5);
        // Cada socio tiene su horario habitual: madrugador, mediodia o noche.
        const franja = elegir([[6, 8], [12, 13], [17, 20], [18, 21]]);
        // Solo puede haber ingresos mientras tuvo membresia: nada antes de su
        // primera inscripcion ni despues del dia en que caduco la ultima.
        const desde = socio.primerInicio;
        const hasta = socio.ultimoFin < hoy() ? socio.ultimoFin : hoy();

        for (let semana = 9; semana >= 0; semana--) {
            // Los feriados y las semanas flojas existen: a veces no viene.
            if (azar() < 0.08) continue;

            const diasElegidos = new Set();
            while (diasElegidos.size < visitasSemana) {
                // Lunes a sabado (1..6); el domingo el gimnasio cierra.
                diasElegidos.add(entero(1, 6));
            }

            for (const diaSemana of diasElegidos) {
                const base = sumarDias(hoy(), -semana * 7);
                // Ajuste al dia de la semana elegido dentro de esa semana.
                const desplazamiento = diaSemana - base.getDay();
                const fecha = sumarDias(base, desplazamiento);

                if (fecha < desde || fecha > hasta) continue;

                const hora = entero(franja[0], franja[1]);
                const marca = conHora(fecha, hora, entero(0, 59));

                await pool.request()
                    .input('UserID', sql.Int, socio.userId)
                    .input('CheckInTime', sql.VarChar(23), fechaHoraSQL(marca))
                    .query(`
                        INSERT INTO dbo.Attendance (UserID, CheckInTime)
                        VALUES (@UserID, CONVERT(datetime, @CheckInTime, 120))
                    `);
                total++;
            }
        }
    }

    console.log(`  [+] ${total} ingresos registrados.`);
    return total;
};

// ============================================================================
// 5. Catalogo de ejercicios, plantillas y rutinas
// ============================================================================

const sembrarCatalogo = async (pool, tablas) => {
    if (!tablas.has('ExerciseCatalog')) return 0;

    console.log('\n🏋️ Cargando catálogo de ejercicios...');
    let creados = 0;

    for (const ejercicio of EJERCICIOS) {
        // Idempotente por nombre: el catalogo es un dato maestro y puede existir
        // parcialmente cargado por los entrenadores.
        const existe = await pool.request()
            .input('Name', sql.NVarChar(150), ejercicio.nombre)
            .query('SELECT ExerciseID FROM dbo.ExerciseCatalog WHERE Name = @Name');

        if (existe.recordset.length > 0) continue;

        await pool.request()
            .input('Name', sql.NVarChar(150), ejercicio.nombre)
            .input('MuscleGroup', sql.NVarChar(100), ejercicio.grupo)
            .input('Description', sql.NVarChar(sql.MAX), ejercicio.descripcion)
            .query(`
                INSERT INTO dbo.ExerciseCatalog (Name, MuscleGroup, Description)
                VALUES (@Name, @MuscleGroup, @Description)
            `);
        creados++;
    }

    console.log(`  [+] ${creados} ejercicios nuevos en el catálogo.`);
    return creados;
};

const sembrarPlantillas = async (pool, coaches, tablas) => {
    if (!tablas.has('RoutineTemplates') || !tablas.has('RoutineTemplateExercises')) return 0;

    console.log('\n📋 Creando plantillas de rutina...');

    for (const plantilla of PLANTILLAS) {
        const coach = coaches[plantilla.coach];
        const resultado = await pool.request()
            .input('CoachID', sql.Int, coach.userId)
            .input('TemplateName', sql.NVarChar(150), plantilla.nombre)
            .input('Goal', sql.NVarChar(255), plantilla.objetivo)
            .query(`
                INSERT INTO dbo.RoutineTemplates (CoachID, TemplateName, Goal)
                OUTPUT INSERTED.TemplateID
                VALUES (@CoachID, @TemplateName, @Goal)
            `);

        const templateId = resultado.recordset[0].TemplateID;

        for (const ejercicio of plantilla.ejercicios) {
            await pool.request()
                .input('TemplateID', sql.Int, templateId)
                .input('ExerciseName', sql.NVarChar(150), ejercicio.nombre)
                .input('Sets', sql.Int, ejercicio.series)
                .input('Reps', sql.Int, ejercicio.reps)
                .input('Weight', sql.Decimal(5, 2), ejercicio.peso)
                .input('DayOfWeek', sql.NVarChar(20), ejercicio.dia)
                .query(`
                    INSERT INTO dbo.RoutineTemplateExercises (TemplateID, ExerciseName, Sets, Reps, Weight, DayOfWeek)
                    VALUES (@TemplateID, @ExerciseName, @Sets, @Reps, @Weight, @DayOfWeek)
                `);
        }
    }

    console.log(`  [+] ${PLANTILLAS.length} plantillas con sus ejercicios.`);
    return PLANTILLAS.length;
};

const sembrarRutinas = async (pool, socios, tablas) => {
    console.log('\n📝 Asignando rutinas a los socios...');

    const conRutina = socios.filter((s) => s.coachId && s.perfil !== 'rechazado');
    let total = 0;

    for (const socio of conRutina) {
        const plantilla = elegir(PLANTILLAS);
        // La rutina no puede ser mas antigua que la inscripcion del socio.
        const diasDeMembresia = Math.round((hoy() - socio.primerInicio) / 86400000);
        const asignada = conHora(
            sumarDias(hoy(), -entero(0, Math.max(0, Math.min(90, diasDeMembresia)))),
            entero(9, 19),
            entero(0, 59)
        );

        const resultado = await pool.request()
            .input('UserID', sql.Int, socio.userId)
            .input('CoachID', sql.Int, socio.coachId)
            .input('RoutineName', sql.VarChar(100), elegir(NOMBRES_RUTINA))
            .input('Goal', sql.VarChar(255), elegir(OBJETIVOS))
            .input('Status', sql.Char(1), 'A')
            .input('AssignedAt', sql.VarChar(23), fechaHoraSQL(asignada))
            .query(`
                INSERT INTO dbo.Routines (UserID, CoachID, RoutineName, Goal, Status, AssignedAt)
                OUTPUT INSERTED.RoutineID
                VALUES (@UserID, @CoachID, @RoutineName, @Goal, @Status, CONVERT(datetime, @AssignedAt, 120))
            `);

        const routineId = resultado.recordset[0].RoutineID;
        socio.routineId = routineId;
        socio.ejerciciosRutina = plantilla.ejercicios;
        total++;

        if (!tablas.has('RoutineExercises')) continue;

        for (const ejercicio of plantilla.ejercicios) {
            // Cada socio maneja su propia carga: se ajusta la de la plantilla.
            const peso = ejercicio.peso ? Number((ejercicio.peso * decimal(0.7, 1.15, 2)).toFixed(2)) : null;

            await pool.request()
                .input('RoutineID', sql.Int, routineId)
                .input('ExerciseName', sql.NVarChar(150), ejercicio.nombre)
                .input('Sets', sql.Int, ejercicio.series)
                .input('Reps', sql.Int, ejercicio.reps)
                .input('Weight', sql.Decimal(5, 2), peso)
                .input('DayOfWeek', sql.NVarChar(20), ejercicio.dia)
                .query(`
                    INSERT INTO dbo.RoutineExercises (RoutineID, ExerciseName, Sets, Reps, Weight, DayOfWeek)
                    VALUES (@RoutineID, @ExerciseName, @Sets, @Reps, @Weight, @DayOfWeek)
                `);
        }
    }

    console.log(`  [+] ${total} rutinas asignadas.`);
    return total;
};

// ============================================================================
// 6. Sesiones de entrenamiento completadas
// ============================================================================

const sembrarSesiones = async (pool, socios, tablas) => {
    if (!tablas.has('WorkoutSessions') || !tablas.has('WorkoutSessionDetails')) return 0;

    console.log('\n💪 Registrando entrenamientos completados...');

    const activos = socios.filter((s) => s.routineId && ['vigente', 'porVencer'].includes(s.perfil));
    let total = 0;

    for (const socio of activos) {
        const sesiones = entero(3, 10);
        // No puede haber entrenamientos registrados antes de que el socio se
        // inscribiera: se limita la antiguedad al tiempo que lleva en el gimnasio.
        const diasDeMembresia = Math.round((hoy() - socio.primerInicio) / 86400000);
        const margen = Math.max(1, Math.min(55, diasDeMembresia));

        for (let i = 0; i < sesiones; i++) {
            const ejercicios = socio.ejerciciosRutina.slice(0, entero(3, socio.ejerciciosRutina.length));
            const fecha = conHora(sumarDias(hoy(), -entero(1, margen)), entero(6, 20), entero(0, 59));

            const resultado = await pool.request()
                .input('UserID', sql.Int, socio.userId)
                .input('RoutineID', sql.Int, socio.routineId)
                .input('CompletedAt', sql.VarChar(23), fechaHoraSQL(fecha))
                .input('TotalExercises', sql.Int, ejercicios.length)
                .query(`
                    INSERT INTO dbo.WorkoutSessions (UserID, RoutineID, CompletedAt, TotalExercisesCompleted)
                    OUTPUT INSERTED.SessionID
                    VALUES (@UserID, @RoutineID, CONVERT(datetime, @CompletedAt, 120), @TotalExercises)
                `);

            const sessionId = resultado.recordset[0].SessionID;

            for (const ejercicio of ejercicios) {
                await pool.request()
                    .input('SessionID', sql.Int, sessionId)
                    .input('ExerciseName', sql.NVarChar(150), ejercicio.nombre)
                    .input('SetsCompleted', sql.Int, ejercicio.series)
                    .input('RepsCompleted', sql.Int, ejercicio.reps + entero(-2, 2))
                    .input('WeightUsed', sql.Decimal(10, 2), ejercicio.peso ? Number((ejercicio.peso * decimal(0.8, 1.1, 2)).toFixed(2)) : null)
                    .query(`
                        INSERT INTO dbo.WorkoutSessionDetails (SessionID, ExerciseName, SetsCompleted, RepsCompleted, WeightUsed)
                        VALUES (@SessionID, @ExerciseName, @SetsCompleted, @RepsCompleted, @WeightUsed)
                    `);
            }

            total++;
        }
    }

    console.log(`  [+] ${total} sesiones de entrenamiento.`);
    return total;
};

// ============================================================================
// 7. Evaluaciones fisicas
// ============================================================================

const sembrarEvaluaciones = async (pool, socios, tablas) => {
    if (!tablas.has('PhysicalEvaluations')) return 0;

    console.log('\n📏 Cargando evaluaciones físicas...');

    const tieneFecha = await existeColumna(pool, 'PhysicalEvaluations', 'EvaluationDate');
    const evaluados = socios.filter((s) => s.coachId && ['vigente', 'porVencer', 'vencida'].includes(s.perfil));
    let total = 0;

    for (const socio of evaluados) {
        // Punto de partida y progreso realista: mediciones mensuales en las que
        // el peso y la grasa bajan mientras la masa muscular sube.
        let peso = decimal(58, 96, 1);
        let grasa = decimal(18, 34, 1);
        let musculo = decimal(28, 42, 1);

        // Una medicion por mes de membresia, con tope de cuatro: un socio de un
        // mes no puede tener un ano de seguimiento. La ultima se toma el dia que
        // dejo de venir, no hoy, si su membresia ya caduco.
        const ultima = socio.ultimoFin < hoy() ? socio.ultimoFin : hoy();
        const meses = Math.floor(Math.round((ultima - socio.primerInicio) / 86400000) / 30);
        const mediciones = Math.max(1, Math.min(4, meses + 1));

        for (let i = mediciones - 1; i >= 0; i--) {
            const fecha = conHora(sumarDias(ultima, -(i * 30 + entero(0, 5))), entero(9, 18), entero(0, 59));

            const peticion = pool.request()
                .input('UserID', sql.Int, socio.userId)
                .input('CoachID', sql.Int, socio.coachId)
                .input('WeightKg', sql.Decimal(5, 2), peso)
                .input('BodyFatPercentage', sql.Decimal(5, 2), grasa)
                .input('MuscleMassPercentage', sql.Decimal(5, 2), musculo);

            if (tieneFecha) {
                peticion.input('EvaluationDate', sql.VarChar(23), fechaHoraSQL(fecha));
                await peticion.query(`
                    INSERT INTO dbo.PhysicalEvaluations
                        (UserID, CoachID, WeightKg, BodyFatPercentage, MuscleMassPercentage, EvaluationDate)
                    VALUES
                        (@UserID, @CoachID, @WeightKg, @BodyFatPercentage, @MuscleMassPercentage,
                         CONVERT(datetime, @EvaluationDate, 120))
                `);
            } else {
                await peticion.query(`
                    INSERT INTO dbo.PhysicalEvaluations
                        (UserID, CoachID, WeightKg, BodyFatPercentage, MuscleMassPercentage)
                    VALUES
                        (@UserID, @CoachID, @WeightKg, @BodyFatPercentage, @MuscleMassPercentage)
                `);
            }

            peso = Number((peso - decimal(0.4, 1.8, 1)).toFixed(1));
            grasa = Number((grasa - decimal(0.3, 1.2, 1)).toFixed(1));
            musculo = Number((musculo + decimal(0.2, 0.9, 1)).toFixed(1));
            total++;
        }
    }

    console.log(`  [+] ${total} evaluaciones con progreso mensual.`);
    return total;
};

// ============================================================================
// 8. Clases grupales y reservas
// ============================================================================

const sembrarClases = async (pool, { coaches, socios }, tablas) => {
    if (!tablas.has('Classes')) return 0;

    console.log('\n🤸 Programando clases grupales...');

    const puedenReservar = socios.filter((s) => ['vigente', 'porVencer'].includes(s.perfil));
    let totalClases = 0;
    let totalReservas = 0;

    for (const clase of CLASES) {
        const coach = coaches[clase.coach];

        // Una ocurrencia pasada (para el historial) y dos proximas (para que la
        // cartelera no aparezca vacia).
        for (const desplazamiento of [-3, 1, 4]) {
            const inicio = conHora(sumarDias(hoy(), desplazamiento), clase.hora, 0);
            const fin = new Date(inicio.getTime() + clase.duracionMin * 60000);

            const resultado = await pool.request()
                .input('ClassName', sql.NVarChar(150), clase.nombre)
                .input('CoachID', sql.Int, coach.userId)
                .input('StartTime', sql.VarChar(23), fechaHoraSQL(inicio))
                .input('EndTime', sql.VarChar(23), fechaHoraSQL(fin))
                .input('MaxCapacity', sql.Int, clase.cupo)
                .input('Description', sql.NVarChar(500), clase.descripcion)
                .query(`
                    INSERT INTO dbo.Classes (ClassName, CoachID, StartTime, EndTime, MaxCapacity, Description)
                    OUTPUT INSERTED.ClassID
                    VALUES (@ClassName, @CoachID, CONVERT(datetime, @StartTime, 120),
                            CONVERT(datetime, @EndTime, 120), @MaxCapacity, @Description)
                `);

            totalClases++;

            if (!tablas.has('ClassReservations')) continue;

            // Ocupacion entre el 30% y el 90% del cupo: ni vacia ni siempre llena.
            const inscritos = Math.min(
                puedenReservar.length,
                Math.round(clase.cupo * decimal(0.3, 0.9, 2))
            );
            const barajados = [...puedenReservar].sort(() => azar() - 0.5).slice(0, inscritos);

            for (const socio of barajados) {
                await pool.request()
                    .input('ClassID', sql.Int, resultado.recordset[0].ClassID)
                    .input('UserID', sql.Int, socio.userId)
                    .query('INSERT INTO dbo.ClassReservations (ClassID, UserID) VALUES (@ClassID, @UserID)');
                totalReservas++;
            }
        }
    }

    console.log(`  [+] ${totalClases} clases con ${totalReservas} reservas.`);
    return totalClases;
};

// ============================================================================
// 9. Notificaciones
// ============================================================================

const sembrarNotificaciones = async (pool, socios) => {
    console.log('\n🔔 Generando notificaciones...');

    let total = 0;

    const insertar = async (userId, { titulo, mensaje, tipo }, fecha, leida) => {
        await pool.request()
            .input('UserID', sql.Int, userId)
            .input('Title', sql.VarChar(100), titulo)
            .input('Message', sql.VarChar(255), mensaje)
            .input('Type', sql.VarChar(50), tipo)
            .input('IsRead', sql.Bit, leida ? 1 : 0)
            .input('CreatedAt', sql.VarChar(23), fechaHoraSQL(fecha))
            .query(`
                INSERT INTO dbo.Notifications (UserID, Title, Message, Type, IsRead, CreatedAt)
                VALUES (@UserID, @Title, @Message, @Type, @IsRead, CONVERT(datetime, @CreatedAt, 120))
            `);
        total++;
    };

    for (const socio of socios) {
        if (socio.perfil === 'inactivo') continue;

        // Las viejas ya fueron leidas; las recientes casi nunca.
        const cantidad = entero(1, 3);
        for (let i = 0; i < cantidad; i++) {
            const dias = entero(1, 60);
            await insertar(socio.userId, elegir(NOTIFICACIONES), conHora(sumarDias(hoy(), -dias), entero(7, 21), entero(0, 59)), dias > 10);
        }

        // Aviso de vencimiento identico al que emite cron/expirationChecker.js
        // cuando faltan 3 dias.
        if (socio.perfil === 'porVencer' && socio.diasRestantes === 3) {
            const vence = sumarDias(hoy(), 3);
            await insertar(
                socio.userId,
                {
                    titulo: 'Aviso de Vencimiento',
                    mensaje: `Tu membresía vence en 3 días (el ${vence.toLocaleDateString('es-EC')}). ¡Renueva pronto!`,
                    tipo: 'Vencimiento'
                },
                conHora(hoy(), 0, 5),
                false
            );
        }

        if (socio.perfil === 'pendiente') {
            await insertar(
                socio.userId,
                {
                    titulo: 'Comprobante recibido',
                    mensaje: 'Recibimos tu comprobante de pago. Lo verificaremos en un máximo de 24 horas.',
                    tipo: 'Pago'
                },
                conHora(sumarDias(hoy(), -1), entero(9, 20), entero(0, 59)),
                false
            );
        }

        if (socio.perfil === 'rechazado') {
            await insertar(
                socio.userId,
                {
                    titulo: 'Comprobante rechazado',
                    mensaje: 'El comprobante enviado no es legible. Por favor vuelve a subirlo o acércate a recepción.',
                    tipo: 'Pago'
                },
                conHora(sumarDias(hoy(), -entero(1, 4)), entero(9, 20), entero(0, 59)),
                false
            );
        }
    }

    console.log(`  [+] ${total} notificaciones.`);
    return total;
};

// ============================================================================
// Limpieza
// ============================================================================

/**
 * Borra exclusivamente lo generado por este sembrador, en orden inverso a las
 * llaves foraneas. El filtro siempre parte del dominio de correo de demo, de
 * modo que ningun socio real puede verse afectado.
 *
 * ExerciseCatalog no se toca: es un dato maestro que los entrenadores tambien
 * alimentan y no hay forma de saber que fila la creo la demostracion.
 */
const limpiar = async (pool, tablas) => {
    console.log('\n🧹 Eliminando datos de demostración...');

    const total = await contarUsuariosDemo(pool);
    if (total === 0) {
        console.log('  [✓] No hay datos de demostración que borrar.');
        return;
    }

    const borrados = {};

    const borrar = async (etiqueta, consulta, requiere) => {
        if (requiere && !tablas.has(requiere)) return;
        const resultado = await pool.request().query(consulta);
        borrados[etiqueta] = resultado.rowsAffected[0] || 0;
    };

    await borrar('Detalles de entrenamiento', `
        DELETE FROM dbo.WorkoutSessionDetails
        WHERE SessionID IN (SELECT SessionID FROM dbo.WorkoutSessions WHERE UserID IN (${USUARIOS_DEMO}))
    `, 'WorkoutSessionDetails');

    await borrar('Entrenamientos', `
        DELETE FROM dbo.WorkoutSessions WHERE UserID IN (${USUARIOS_DEMO})
    `, 'WorkoutSessions');

    await borrar('Ejercicios de rutina', `
        DELETE FROM dbo.RoutineExercises
        WHERE RoutineID IN (SELECT RoutineID FROM dbo.Routines WHERE UserID IN (${USUARIOS_DEMO}) OR CoachID IN (${USUARIOS_DEMO}))
    `, 'RoutineExercises');

    await borrar('Rutinas', `
        DELETE FROM dbo.Routines WHERE UserID IN (${USUARIOS_DEMO}) OR CoachID IN (${USUARIOS_DEMO})
    `);

    await borrar('Ejercicios de plantilla', `
        DELETE FROM dbo.RoutineTemplateExercises
        WHERE TemplateID IN (SELECT TemplateID FROM dbo.RoutineTemplates WHERE CoachID IN (${USUARIOS_DEMO}))
    `, 'RoutineTemplateExercises');

    await borrar('Plantillas', `
        DELETE FROM dbo.RoutineTemplates WHERE CoachID IN (${USUARIOS_DEMO})
    `, 'RoutineTemplates');

    await borrar('Reservas de clase', `
        DELETE FROM dbo.ClassReservations
        WHERE UserID IN (${USUARIOS_DEMO})
           OR ClassID IN (SELECT ClassID FROM dbo.Classes WHERE CoachID IN (${USUARIOS_DEMO}))
    `, 'ClassReservations');

    await borrar('Clases', `
        DELETE FROM dbo.Classes WHERE CoachID IN (${USUARIOS_DEMO})
    `, 'Classes');

    await borrar('Horarios de entrenador', `
        DELETE FROM dbo.CoachWorkHours WHERE CoachID IN (${USUARIOS_DEMO})
    `, 'CoachWorkHours');

    await borrar('Evaluaciones físicas', `
        DELETE FROM dbo.PhysicalEvaluations WHERE UserID IN (${USUARIOS_DEMO}) OR CoachID IN (${USUARIOS_DEMO})
    `, 'PhysicalEvaluations');

    // El administrador de demostracion puede figurar como auditor de pagos
    // reales; se libera la referencia antes de borrarlo.
    if (await existeColumna(pool, 'Payments', 'LastModifiedBy')) {
        await pool.request().query(`
            UPDATE dbo.Payments SET LastModifiedBy = NULL WHERE LastModifiedBy IN (${USUARIOS_DEMO})
        `);
    }

    await borrar('Pagos', `
        DELETE FROM dbo.Payments
        WHERE SubscriptionID IN (SELECT SubscriptionID FROM dbo.Subscriptions WHERE UserID IN (${USUARIOS_DEMO}))
    `);

    await borrar('Suscripciones', `
        DELETE FROM dbo.Subscriptions WHERE UserID IN (${USUARIOS_DEMO})
    `);

    await borrar('Asignaciones de entrenador', `
        DELETE FROM dbo.CoachAssignments WHERE CoachID IN (${USUARIOS_DEMO}) OR MemberID IN (${USUARIOS_DEMO})
    `);

    await borrar('Permisos de entrenador', `
        DELETE FROM dbo.CoachPermissions WHERE CoachID IN (${USUARIOS_DEMO})
    `);

    await borrar('Registro de correos', `
        DELETE FROM dbo.EmailLogs WHERE UserID IN (${USUARIOS_DEMO})
    `, 'EmailLogs');

    // Attendance, Notifications y PasswordResetTokens tienen ON DELETE CASCADE,
    // pero se borran explicitamente para poder informar cuantas filas eran.
    await borrar('Asistencias', `DELETE FROM dbo.Attendance WHERE UserID IN (${USUARIOS_DEMO})`);
    await borrar('Notificaciones', `DELETE FROM dbo.Notifications WHERE UserID IN (${USUARIOS_DEMO})`);
    await borrar('Tokens de recuperación', `
        DELETE FROM dbo.PasswordResetTokens WHERE UserID IN (${USUARIOS_DEMO})
    `, 'PasswordResetTokens');

    await borrar('Usuarios', `DELETE FROM dbo.Users WHERE Email LIKE '%@${DOMINIO_DEMO}'`);

    for (const [etiqueta, cantidad] of Object.entries(borrados)) {
        if (cantidad > 0) console.log(`  [-] ${etiqueta}: ${cantidad}`);
    }
    console.log('  [✓] Limpieza completada.');
};

// ============================================================================
// Resumen final
// ============================================================================

const mostrarResumen = async (pool) => {
    const resultado = await pool.request().query(`
        WITH Demo AS (${USUARIOS_DEMO})
        SELECT
            (SELECT COUNT(*) FROM dbo.Users WHERE UserID IN (SELECT UserID FROM Demo)) AS Usuarios,
            (SELECT COUNT(*) FROM dbo.Subscriptions WHERE UserID IN (SELECT UserID FROM Demo)) AS Suscripciones,
            (SELECT COUNT(*) FROM dbo.Payments WHERE SubscriptionID IN
                (SELECT SubscriptionID FROM dbo.Subscriptions WHERE UserID IN (SELECT UserID FROM Demo))) AS Pagos,
            (SELECT COUNT(*) FROM dbo.Attendance WHERE UserID IN (SELECT UserID FROM Demo)) AS Asistencias,
            (SELECT COUNT(*) FROM dbo.Routines WHERE UserID IN (SELECT UserID FROM Demo)) AS Rutinas,
            (SELECT COUNT(*) FROM dbo.Notifications WHERE UserID IN (SELECT UserID FROM Demo)) AS Notificaciones
    `);

    const r = resultado.recordset[0];
    console.log('\n📊 Resumen de datos de demostración:');
    console.log(`   Usuarios ........ ${r.Usuarios}`);
    console.log(`   Suscripciones ... ${r.Suscripciones}`);
    console.log(`   Pagos ........... ${r.Pagos}`);
    console.log(`   Asistencias ..... ${r.Asistencias}`);
    console.log(`   Rutinas ......... ${r.Rutinas}`);
    console.log(`   Notificaciones .. ${r.Notificaciones}`);
};

// ============================================================================
// Programa principal
// ============================================================================

const TABLAS_OPCIONALES = [
    'ExerciseCatalog', 'RoutineTemplates', 'RoutineTemplateExercises', 'RoutineExercises',
    'Classes', 'ClassReservations', 'CoachWorkHours', 'PhysicalEvaluations',
    'WorkoutSessions', 'WorkoutSessionDetails', 'EmailLogs', 'PasswordResetTokens'
];

const ejecutar = async () => {
    const argumentos = process.argv.slice(2);
    const soloLimpiar = argumentos.includes('--limpiar');
    const forzar = argumentos.includes('--forzar');

    const pool = await poolPromise;
    const tablas = await detectarTablas(pool, TABLAS_OPCIONALES);

    const faltantes = TABLAS_OPCIONALES.filter((t) => !tablas.has(t));
    if (faltantes.length > 0) {
        console.log(`ℹ️  Tablas no encontradas en esta base (se omiten): ${faltantes.join(', ')}`);
    }

    if (soloLimpiar) {
        await limpiar(pool, tablas);
        return;
    }

    const existentes = await contarUsuariosDemo(pool);
    if (existentes > 0) {
        if (!forzar) {
            console.log(`\n⚠️  Ya existen ${existentes} usuarios de demostración en la base.`);
            console.log('   Usa --forzar para regenerarlos o --limpiar para borrarlos.');
            return;
        }
        await limpiar(pool, tablas);
    }

    console.log('\n🚀 Generando datos de demostración para Slimming Gym Fitness');
    console.log(`   Dominio de las cuentas: @${DOMINIO_DEMO}`);
    console.log(`   Contraseña de todas las cuentas: ${PASSWORD_DEMO}`);

    const roles = await obtenerRoles(pool);
    for (const rol of ['Admin', 'Coach', 'Member']) {
        if (!roles[rol]) {
            throw new Error(`Falta el rol '${rol}'. Ejecuta primero: npm run seed`);
        }
    }

    const planes = await obtenerPlanes(pool);
    if (planes.length === 0) {
        throw new Error('No hay planes activos. Ejecuta primero: npm run seed');
    }

    const usuarios = await sembrarUsuarios(pool, roles, planes);
    await sembrarCoaches(pool, usuarios, tablas);
    await sembrarSuscripciones(pool, usuarios, tablas);
    await sembrarAsistencias(pool, usuarios.socios);
    await sembrarCatalogo(pool, tablas);
    await sembrarPlantillas(pool, usuarios.coaches, tablas);
    await sembrarRutinas(pool, usuarios.socios, tablas);
    await sembrarSesiones(pool, usuarios.socios, tablas);
    await sembrarEvaluaciones(pool, usuarios.socios, tablas);
    await sembrarClases(pool, usuarios, tablas);
    await sembrarNotificaciones(pool, usuarios.socios);

    await mostrarResumen(pool);

    console.log('\n✅ Datos de demostración generados.');
    console.log('\n   Cuentas para probar la aplicación:');
    console.log(`   Coach  → ${usuarios.coaches[0].email}`);
    console.log(`   Admin  → ${usuarios.admins[0].email}`);
    console.log(`   Socio  → ${usuarios.socios[0].email}`);
    console.log(`   Contraseña en todas: ${PASSWORD_DEMO}\n`);
};

if (require.main === module) {
    ejecutar()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('\n❌ Error generando los datos de demostración:', error.message);
            console.error(error);
            process.exit(1);
        });
}

module.exports = { ejecutar, limpiar };
